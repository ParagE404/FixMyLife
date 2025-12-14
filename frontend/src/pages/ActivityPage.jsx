import { useState } from 'react';
import { TextActivityInput } from '../components/activity/TextActivityInput';
import { VoiceActivityInput } from '../components/activity/VoiceActivityInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { PenTool, Mic, CheckCircle, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ActivityPage() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleActivitiesCreated = (activities) => {
    setMessage(`Created ${activities.length} activities!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass card-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <PenTool className="w-6 h-6 text-purple-600" />
              </div>
              Log Activities
            </CardTitle>
            <CardDescription>
              Describe your day and we'll categorize it for you automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={() => navigate('/history')} 
              variant="outline" 
              className="w-full"
            >
              <History className="w-4 h-4 mr-2" />
              View Activity History
            </Button>
          </CardContent>
        </Card>

        {/* Success Message */}
        {message && (
          <Badge variant="success" className="w-full justify-center py-3 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            {message}
            <Button 
              onClick={() => navigate('/history')} 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-xs"
            >
              View History
            </Button>
          </Badge>
        )}

        {/* Activity Input Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice Input
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-6">
                <TextActivityInput onActivitiesCreated={handleActivitiesCreated} />
              </TabsContent>
              
              <TabsContent value="voice" className="mt-6">
                <VoiceActivityInput onActivitiesCreated={handleActivitiesCreated} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
