import { useState } from 'react';
import { QuickActivityEntry } from './QuickActivityEntry';
import { SmartSuggestions } from './SmartSuggestions';
import { TextActivityInput } from './TextActivityInput';
import { VoiceActivityInput } from './VoiceActivityInput';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Zap, 
  Lightbulb, 
  PenTool, 
  Mic, 
  Sparkles
} from 'lucide-react';

export function ImprovedActivityInput({ onActivitiesCreated }) {
  const [activeTab, setActiveTab] = useState('quick');

  const handleActivitiesCreated = (activities) => {
    if (onActivitiesCreated) {
      onActivitiesCreated(activities);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Input Methods */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Quick</span>
              </TabsTrigger>
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Smart</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Entry
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Instantly log activities with one tap
                  </p>
                </div>
                <QuickActivityEntry onActivityCreated={handleActivitiesCreated} />
              </div>
            </TabsContent>
            
            <TabsContent value="smart" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Smart Suggestions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered suggestions based on your patterns
                  </p>
                </div>
                <SmartSuggestions onActivitySelected={handleActivitiesCreated} />
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    Text Input
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe multiple activities in natural language
                  </p>
                </div>
                <TextActivityInput onActivitiesCreated={handleActivitiesCreated} />
              </div>
            </TabsContent>
            
            <TabsContent value="voice" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Voice Input
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Speak naturally about your activities
                  </p>
                </div>
                <VoiceActivityInput onActivitiesCreated={handleActivitiesCreated} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use <strong>Quick Entry</strong> for common activities</li>
                <li>• Try <strong>Smart Suggestions</strong> for personalized recommendations</li>
                <li>• Use <strong>Text Input</strong> to log multiple activities at once</li>
                <li>• Use <strong>Voice Input</strong> when you're on the go</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}