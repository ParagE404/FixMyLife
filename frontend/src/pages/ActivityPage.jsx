import { useState } from 'react';
import { TextActivityInput } from '../components/activity/TextActivityInput';
import { VoiceActivityInput } from '../components/activity/VoiceActivityInput';

export function ActivityPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [message, setMessage] = useState('');

  const handleActivitiesCreated = (activities) => {
    setMessage(`✅ Created ${activities.length} activities!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Log Activities</h1>
          <p className="text-text-secondary text-sm">
            Describe your day and we'll categorize it for you
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="p-3 bg-green-100 text-green-700 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'text'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'voice'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            🎤 Voice
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'text' && (
            <TextActivityInput onActivitiesCreated={handleActivitiesCreated} />
          )}
          {activeTab === 'voice' && (
            <VoiceActivityInput
              onActivitiesCreated={handleActivitiesCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
