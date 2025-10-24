
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Target, TrendingUp, Zap } from "lucide-react";

interface SuccessMetricsProps {
  onComplete: () => void;
}

const SuccessMetrics = ({ onComplete }: SuccessMetricsProps) => {
  const [activeTab, setActiveTab] = useState("define");
  
  const metrics = [
    { id: "leads", label: "Leads Generated", defaultValue: "0" },
    { id: "meetings", label: "Meetings Booked", defaultValue: "0" },
    { id: "opportunities", label: "Opportunities Created", defaultValue: "0" },
    { id: "conversion", label: "Conversion Rate (%)", defaultValue: "0" },
    { id: "revenue", label: "Revenue Generated ($)", defaultValue: "0" },
    { id: "cycle", label: "Sales Cycle (days)", defaultValue: "0" }
  ];
  
  const dashboards = [
    { id: "pipeline", name: "Pipeline Overview", description: "Track leads as they move through your sales process", icon: TrendingUp },
    { id: "performance", name: "Agent Performance", description: "Monitor how well your AI agents are performing", icon: Zap },
    { id: "conversion", name: "Conversion Analytics", description: "See what's working and what's not in your funnel", icon: Target },
    { id: "revenue", name: "Revenue Tracking", description: "Track your ROI and revenue generation", icon: BarChart3 }
  ];

  const handleNext = () => {
    setActiveTab(activeTab === "define" ? "baseline" : activeTab === "baseline" ? "dashboard" : "define");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">Success Metrics</h2>
          <p className="text-muted-foreground">Define and track what success looks like for your organization</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="define">Define KPIs</TabsTrigger>
          <TabsTrigger value="baseline">Set Baselines</TabsTrigger>
          <TabsTrigger value="dashboard">Select Dashboards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="define" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Select the metrics that matter most to your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox id={`kpi-${metric.id}`} defaultChecked />
                    <Label htmlFor={`kpi-${metric.id}`} className="text-base">{metric.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext}>Next: Set Baselines</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="baseline" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Current Performance Baselines</CardTitle>
              <CardDescription>Enter your current metrics to track improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <Label htmlFor={`baseline-${metric.id}`}>{metric.label}</Label>
                    <Input 
                      id={`baseline-${metric.id}`} 
                      defaultValue={metric.defaultValue} 
                      type={metric.id === "conversion" ? "number" : "text"}
                      min={0}
                      max={metric.id === "conversion" ? 100 : undefined}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext}>Next: Select Dashboards</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Custom Dashboards</CardTitle>
              <CardDescription>Select the dashboards you'd like to use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboards.map((dashboard) => (
                  <div key={dashboard.id} className="border rounded-lg p-4 flex items-start space-x-4">
                    <div className="mt-1">
                      <Checkbox id={`dashboard-${dashboard.id}`} defaultChecked={dashboard.id === "pipeline" || dashboard.id === "performance"} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`dashboard-${dashboard.id}`} className="text-base font-medium">{dashboard.name}</Label>
                      <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-6">
            <Button onClick={onComplete}>Complete & Continue</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuccessMetrics;
