import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config.js';
import { throwError } from '../middleware/errorHandler.js';
import redisService from './redis.service.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_AUDIO_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Transcribe audio using Groq's Whisper
export const transcribeAudioWithWhisper = async (audioBuffer, mimeType) => {
  try {
    if (!config.groq.apiKey) {
      throwError('Groq API key not configured', 500);
    }

    // Determine file extension from mime type
    const extMap = {
      'audio/webm': 'webm',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/flac': 'flac',
    };
    const ext = extMap[mimeType] || 'webm';

    // Create form data
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: `audio.${ext}`,
      contentType: mimeType,
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    console.log('🎤 Sending audio to Groq Whisper API...');

    const response = await axios.post(GROQ_AUDIO_URL, formData, {
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        ...formData.getHeaders(),
      },
      timeout: 30000,
      maxContentLength: 25 * 1024 * 1024,
      maxBodyLength: 25 * 1024 * 1024,
    });

    console.log('✅ Whisper transcription received');
    return response.data.text || '';
  } catch (error) {
    console.error('🔴 Whisper Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throwError('Failed to transcribe audio', 500);
  }
};

export const parseActivityWithLLM = async (userInput, customCategories = []) => {
  try {
    if (!config.groq.apiKey) {
      throwError('Groq API key not configured', 500);
    }

    // Build category list
    const defaultCategories = [
      'Physical Health',
      'Career & Finances',
      'Relationships',
      'Emotional & Mental Health',
      'Personal Growth',
    ];

    const allCategories = [...defaultCategories, ...customCategories];

    // Check cache first - cache based on input and available categories
    const cacheKey = redisService.getLLMKey(userInput, allCategories);
    const cached = await redisService.get(cacheKey);
    if (cached) {
      console.log('📦 LLM parsing served from cache');
      return cached;
    }

    const systemPrompt = `You are an activity parsing assistant. Parse the user's activity description into discrete activities with categories and times.

Return ONLY valid JSON array (no markdown, no explanation). If parsing fails, return empty array [].

Categories: ${allCategories.join(', ')}

For each activity, extract:
- description: brief activity name
- category: must match one from above list
- startTime: HH:MM format (24-hour)
- endTime: HH:MM format (24-hour), or null if unknown
- confidenceScore: 0-1 (how confident you are in the categorization)

Example:
Input: "Worked 9-5, lunch at noon, gym at 6"
Output: [
  {"description":"Work","category":"Career & Finances","startTime":"09:00","endTime":"17:00","confidenceScore":0.95},
  {"description":"Lunch","category":"Physical Health","startTime":"12:00","endTime":"13:00","confidenceScore":0.9},
  {"description":"Gym","category":"Physical Health","startTime":"18:00","endTime":"19:00","confidenceScore":0.95}
]`;

    console.log('🔄 Sending request to Groq API...');
    console.log('User input:', userInput);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Groq API response received');
    const content = response.data.choices[0]?.message?.content || '[]';
    console.log('LLM Response:', content);
    
    // Try to parse JSON
    let parsedActivities = [];
    try {
      parsedActivities = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse LLM response as JSON:', content);
      // Try to extract JSON from markdown if it's wrapped
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsedActivities = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          parsedActivities = [];
        }
      }
    }

    const result = Array.isArray(parsedActivities) ? parsedActivities : [];

    // Cache successful results for 24 hours (86400 seconds)
    // Similar inputs will likely have similar outputs
    if (result.length > 0) {
      await redisService.set(cacheKey, result, 86400);
      console.log('💾 LLM parsing result cached');
    }

    return result;
  } catch (error) {
    console.error('🔴 LLM Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throwError('Failed to parse activities with LLM', 500);
  }
};

export const generateRecommendations = async (userId, activityHistory, goals) => {
  try {
    if (!config.groq.apiKey) {
      return []; // Return empty if no API key
    }

    // Build activity summary
    const categorySummary = {};
    activityHistory.forEach((activity) => {
      if (!categorySummary[activity.category]) {
        categorySummary[activity.category] = 0;
      }
      const duration = activity.endTime && activity.startTime
        ? (new Date(activity.endTime) - new Date(activity.startTime)) / (1000 * 60 * 60)
        : 0;
      categorySummary[activity.category] += duration;
    });

    const systemPrompt = `You are a lifestyle coach. Generate 2-3 specific, personalized recommendations based on user patterns.

Return ONLY a JSON array of recommendations (no markdown, no explanation).

Format: [
  {"type":"pattern","title":"...","message":"..."},
  {"type":"goal","title":"...","message":"..."},
  {"type":"insight","title":"...","message":"..."}
]`;

    const userContent = `Activity summary (last 7 days, hours per category):
${Object.entries(categorySummary).map(([cat, hrs]) => `- ${cat}: ${hrs.toFixed(1)} hours`).join('\n')}

Goals: ${goals.map(g => `${g.title} (${g.targetValue}${g.unit})`).join(', ') || 'None'}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.5,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || '[]';
    let recommendations = [];
    try {
      recommendations = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse recommendations:', content);
    }

    return Array.isArray(recommendations) ? recommendations : [];
  } catch (error) {
    console.error('Recommendation generation error:', error.message);
    return [];
  }
};