import { useState } from "react";
import { activityService } from "../../services/activity.service";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  Sparkles, 
  Clock, 
  Tag, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";

export function TextActivityInput({ onActivitiesCreated }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedActivities, setParsedActivities] = useState([]);
  const { token } = useAuthStore();

  const handleParse = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await activityService.parseActivities(input, token);
      console.log("Parsed Activities:", result.activities);
      setParsedActivities(result.activities || []);
    } catch (err) {
      setError(err.message);
      setParsedActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      // The activities are already created by parseActivities, so we just need to notify
      if (onActivitiesCreated) {
        onActivitiesCreated(parsedActivities);
      }
      setInput("");
      setParsedActivities([]);
    } catch (error) {
      setError('Failed to save activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (index, field, value) => {
    const updated = [...parsedActivities];
    updated[index] = { ...updated[index], [field]: value };
    setParsedActivities(updated);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleParse} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="activity-input" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Describe your activities
          </Label>
          <Textarea
            id="activity-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: 'Worked on project from 9-12, had lunch at 12:30, went to gym at 6pm for 1 hour'"
            className="min-h-[100px] resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
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
      </form>

      {/* Parsed Activities Preview */}
      {parsedActivities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">Review & Confirm Activities</h3>
          </div>

          <div className="space-y-3">
            {parsedActivities.map((activity, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Activity {idx + 1}</CardTitle>
                    <Badge 
                      variant={activity.confidenceScore > 0.7 ? "success" : "warning"}
                      className="text-xs"
                    >
                      {(activity.confidenceScore * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`desc-${idx}`} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </Label>
                    <Input
                      id={`desc-${idx}`}
                      value={activity.description}
                      onChange={(e) =>
                        handleEdit(idx, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cat-${idx}`} className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Category
                    </Label>
                    <Input
                      id={`cat-${idx}`}
                      value={activity.category?.name || activity.customCategory?.name || 'Unknown'}
                      onChange={(e) => handleEdit(idx, "category", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${idx}`} className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Start Time
                      </Label>
                      <Input
                        id={`start-${idx}`}
                        type="time"
                        value={
                          activity.startTime
                            ? activity.startTime.substring(11, 16)
                            : ""
                        }
                        onChange={(e) =>
                          handleEdit(idx, "startTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${idx}`} className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        End Time
                      </Label>
                      <Input
                        id={`end-${idx}`}
                        type="time"
                        value={
                          activity.endTime
                            ? activity.endTime.substring(11, 16)
                            : ""
                        }
                        onChange={(e) => handleEdit(idx, "endTime", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <Button
            onClick={handleConfirm}
            variant="success"
            size="lg"
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm & Save {parsedActivities.length} Activities
          </Button>
        </div>
      )}
    </div>
  );
}
