
import { useState, useEffect } from 'react';
import { useElevenLabsTracking } from '@/hooks/useElevenLabsTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

export const ElevenLabsDashboard = () => {
  const { getCallInteractions, getCostSummary } = useElevenLabsTracking();
  const [interactions, setInteractions] = useState<any[]>([]);
  const [costSummary, setCostSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [interactionsData, summaryData] = await Promise.all([
      getCallInteractions(),
      getCostSummary()
    ]);
    setInteractions(interactionsData);
    setCostSummary(summaryData);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eleven Labs Dashboard</h1>
        <Button onClick={loadData}>Refresh</Button>
      </div>

      {/* Cost Summary */}
      {costSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${costSummary.totalCost.toFixed(4)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costSummary.totalCalls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Characters Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costSummary.totalCharacters.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(costSummary.totalDuration / 60)}m</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Interactions</CardTitle>
          <CardDescription>Latest Eleven Labs API calls and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={interaction.status === 'completed' ? 'default' : 'destructive'}>
                      {interaction.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    ${interaction.total_cost?.toFixed(4) || '0.0000'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Voice:</span> {interaction.voice_name || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span> {interaction.call_duration_seconds || 0}s
                  </div>
                  <div>
                    <span className="text-gray-500">Characters:</span> {interaction.characters_used || 0}
                  </div>
                  <div>
                    <span className="text-gray-500">Latency:</span> {interaction.response_latency_ms || 0}ms
                  </div>
                </div>

                {interaction.input_transcript && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Input:</div>
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      {interaction.input_transcript}
                    </div>
                  </div>
                )}

                {interaction.output_transcript && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Output:</div>
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      {interaction.output_transcript}
                    </div>
                  </div>
                )}

                {interaction.error_message && (
                  <div className="mt-2">
                    <div className="text-xs text-red-500 mb-1">Error:</div>
                    <div className="text-sm bg-red-50 p-2 rounded text-red-700">
                      {interaction.error_message}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {interactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No call interactions logged yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
