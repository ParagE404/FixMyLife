import { useState, useRef, useEffect } from 'react';
import { activityService } from '../../services/activity.service';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Mic,
  Square,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Send,
  RotateCcw,
} from 'lucide-react';

// Animated voice orb component
function VoiceOrb({ isRecording, audioLevel, disabled }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <div
        className={`absolute w-32 h-32 rounded-full transition-all duration-300 ${
          isRecording
            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse'
            : disabled
              ? 'bg-gray-300/30'
              : 'bg-gray-200/50'
        }`}
        style={{
          transform: isRecording ? `scale(${1 + audioLevel * 0.3})` : 'scale(1)',
        }}
      />
      <div
        className={`absolute w-24 h-24 rounded-full transition-all duration-200 ${
          isRecording
            ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30'
            : 'bg-gray-200/30'
        }`}
        style={{
          transform: isRecording ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
        }}
      />

      {/* Main orb */}
      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isRecording
            ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/50'
            : disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer'
        }`}
        style={{
          transform: isRecording ? `scale(${1 + audioLevel * 0.1})` : 'scale(1)',
        }}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white fill-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </div>
    </div>
  );
}

// Waveform visualization
function Waveform({ isActive, audioLevel = 0 }) {
  const bars = 40;
  return (
    <div className="flex items-center justify-center gap-[2px] h-12 overflow-hidden">
      {[...Array(bars)].map((_, i) => {
        const waveOffset = Math.sin((i / bars) * Math.PI * 2) * 0.5 + 0.5;
        const height = isActive ? 20 + waveOffset * 60 + audioLevel * 20 : 20;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${
              isActive ? 'bg-red-500' : 'bg-gray-300'
            }`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

export function VoiceActivityInput({ onActivitiesCreated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [parsedActivities, setParsedActivities] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const { token } = useAuthStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      audioChunksRef.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyzer for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Start level monitoring
      const updateLevel = () => {
        if (!analyserRef.current || !isRecording) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128);
        animationRef.current = requestAnimationFrame(updateLevel);
      };

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Transcribe
        if (audioBlob.size > 0) {
          await transcribeRecording(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start visualization
      updateLevel();
    } catch (err) {
      console.error('Recording error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const transcribeRecording = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const result = await activityService.transcribeAudio(audioBlob, token);
      if (result.transcript) {
        setTranscript(result.transcript);
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleParse = async () => {
    if (!transcript.trim()) {
      setError('No transcript to parse');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await activityService.parseActivities(transcript, token);
      setParsedActivities(result.activities || []);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (onActivitiesCreated && parsedActivities.length > 0) {
      onActivitiesCreated(parsedActivities);
    }
    handleReset();
  };

  const handleReset = () => {
    setTranscript('');
    setParsedActivities([]);
    setShowResults(false);
    setError('');
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <div className="flex flex-col items-center py-8 space-y-6">
          {/* Voice Orb */}
          <div
            onClick={!isTranscribing ? handleToggleRecording : undefined}
            className={isTranscribing ? 'cursor-not-allowed' : 'cursor-pointer'}
          >
            <VoiceOrb
              isRecording={isRecording}
              audioLevel={audioLevel}
              disabled={isTranscribing}
            />
          </div>

          {/* Status */}
          <div className="text-center space-y-2">
            {isTranscribing ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <p className="text-lg font-medium text-purple-600">Transcribing...</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Converting your speech to text
                </p>
              </>
            ) : isRecording ? (
              <>
                <p className="text-lg font-medium text-red-500">
                  Recording... {formatTime(recordingTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tap to stop when you're done
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">
                  {transcript ? 'Tap to record more' : 'Tap to start recording'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tell me what you did today
                </p>
              </>
            )}
          </div>

          {/* Waveform */}
          {isRecording && (
            <div className="w-full max-w-md">
              <Waveform isActive={isRecording} audioLevel={audioLevel} />
            </div>
          )}

          {/* Transcript */}
          {transcript && !isRecording && (
            <Card className="w-full max-w-md">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">{transcript}</p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-md w-full space-y-3">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Actions */}
          {transcript && !isRecording && !isTranscribing && !error && (
            <div className="flex gap-3 w-full max-w-md">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button
                onClick={handleParse}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Parse Activities
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Tips */}
          {!transcript && !isRecording && !error && (
            <div className="text-center text-sm text-muted-foreground max-w-md">
              <p className="font-medium mb-2">Try saying:</p>
              <div className="space-y-1 text-xs">
                <p>"I worked from 9 to 5, had lunch at noon, and went to the gym at 6"</p>
                <p>"Meditated for 20 minutes this morning, then read for an hour"</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-lg">
                Found {parsedActivities.length} Activities
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">You said:</span> "{transcript.trim()}"
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {parsedActivities.map((activity, idx) => (
              <Card key={idx} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {activity.category?.name || activity.category}
                        </Badge>
                        <span>•</span>
                        <span>
                          {activity.startTime}
                          {activity.endTime && ` - ${activity.endTime}`}
                        </span>
                      </div>
                    </div>
                    {activity.confidenceScore && (
                      <Badge
                        variant={activity.confidenceScore > 0.8 ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {Math.round(activity.confidenceScore * 100)}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
