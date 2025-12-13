import { useState, useRef, useEffect } from 'react';
import { activityService } from '../../services/activity.service';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Volume2,
  FileAudio
} from 'lucide-react';

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
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + ' ');
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
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5" />
            Voice Recording
          </CardTitle>
          <CardDescription>
            Speak naturally about your activities and we'll parse them for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="w-full"
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          {isRecording && (
            <div className="text-center">
              <Badge variant="default" className="animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                Recording... (stops after 3s of silence)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed">{transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Parse Button */}
      {transcript && (
        <Button
          onClick={handleParse}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing activities...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Parse Activities
            </>
          )}
        </Button>
      )}

      {/* Parsed Activities Preview */}
      {parsedActivities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">
              Found {parsedActivities.length} Activities
            </h3>
          </div>

          <div className="space-y-3">
            {parsedActivities.map((activity, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <p className="font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {activity.category?.name || activity.category}
                      </Badge>
                      <span>•</span>
                      <span>{activity.startTime} - {activity.endTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <Button
            onClick={handleConfirm}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm & Save {parsedActivities.length} Activities
          </Button>
        </div>
      )}
    </div>
  );
}
