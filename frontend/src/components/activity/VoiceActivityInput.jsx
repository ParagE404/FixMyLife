import { useState, useRef, useEffect } from 'react';
import { activityService } from '../../services/activity.service';
import { useAuthStore } from '../../stores/authStore';

export function VoiceActivityInput({ onActivitiesCreated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedActivities, setParsedActivities] = useState([]);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => {
    // Setup speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + ' ');
        } else {
          interimTranscript += transcript;
        }
      }

      // Reset silence timeout on each result
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 3000); // Stop after 3 seconds of silence
    };

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearTimeout(silenceTimeoutRef.current);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleStartRecording = () => {
    setTranscript('');
    setError('');
    recognitionRef.current?.start();
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
  };

  const handleParse = async () => {
    if (!transcript.trim()) {
      setError('Please record some audio first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await activityService.parseActivities(transcript, token);
      setParsedActivities(result.activities || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (onActivitiesCreated) {
      onActivitiesCreated(parsedActivities);
    }
    setTranscript('');
    setParsedActivities([]);
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="space-y-3">
        <button
          onClick={
            isRecording ? handleStopRecording : handleStartRecording
          }
          className={`w-full py-3 text-white rounded-lg font-medium text-lg ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </button>

        {isRecording && (
          <div className="text-center text-sm text-blue-600 font-medium">
            Recording... (stops after 3s of silence)
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Transcript:</p>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Parse Button */}
      {transcript && (
        <button
          onClick={handleParse}
          disabled={isLoading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Parsing...' : 'Parse Activities'}
        </button>
      )}

      {/* Parsed Activities Preview */}
      {parsedActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">
            Found {parsedActivities.length} Activities
          </h3>

          {parsedActivities.map((activity, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <p className="font-medium">{activity.description}</p>
              <p className="text-sm text-gray-600">
                {activity.category} • {activity.startTime} - {activity.endTime}
              </p>
            </div>
          ))}

          <button
            onClick={handleConfirm}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Confirm & Save Activities
          </button>
        </div>
      )}
    </div>
  );
}
