import { useState, useEffect, useCallback } from 'react';
import { goalsService } from '../../services/goals.service';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { LoadingCard } from '../ui/loading';
import { 
  Lightbulb, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export function RecommendationsPanel() {
  const { token } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalsService.getRecommendations(token);
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) return <LoadingCard text="Loading insights..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <Button
          onClick={loadRecommendations}
          variant="ghost"
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No insights yet</p>
                <p className="text-xs text-muted-foreground">
                  Keep logging activities to get personalized recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge 
                      variant={getPriorityVariant(rec.priority)} 
                      className="flex items-center gap-1 text-xs"
                    >
                      {getPriorityIcon(rec.priority)}
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
