
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, HeadphonesIcon, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";

const SupportSetup = () => {
  const [selectedSupport, setSelectedSupport] = useState("dedicated");
  const [scheduledCall, setScheduledCall] = useState(false);
  
  const supportOptions = [
    {
      id: "dedicated",
      title: "Dedicated Account Manager",
      description: "Get personalized support from a dedicated specialist",
      icon: HeadphonesIcon
    },
    {
      id: "team",
      title: "Support Team",
      description: "Access our entire support team for faster responses",
      icon: Users
    }
  ];
  
  const communicationPreferences = [
    { id: "email", label: "Email Updates" },
    { id: "slack", label: "Slack Channel" },
    { id: "chat", label: "In-app Chat" },
    { id: "calls", label: "Weekly Check-ins" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
          <HeadphonesIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">Support Channel Setup</h2>
          <p className="text-muted-foreground">Configure how you'll receive support and communicate with us</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Support Type</CardTitle>
            <CardDescription>Choose your preferred support option</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue={selectedSupport} onValueChange={setSelectedSupport}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportOptions.map((option) => (
                  <div key={option.id} className={`border rounded-lg p-4 ${selectedSupport === option.id ? 'border-ai-cyan bg-ai-cyan/5' : 'border-border'}`}>
                    <RadioGroupItem 
                      value={option.id} 
                      id={`support-${option.id}`} 
                      className="sr-only" 
                    />
                    <Label 
                      htmlFor={`support-${option.id}`}
                      className="flex flex-col h-full cursor-pointer"
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-full ${selectedSupport === option.id ? 'bg-ai-cyan' : 'bg-muted'} flex items-center justify-center mr-2`}>
                          <option.icon className={`h-4 w-4 ${selectedSupport === option.id ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="font-medium">{option.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>Select how you'd like to receive updates and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communicationPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center space-x-2">
                  <Checkbox id={`pref-${pref.id}`} defaultChecked={pref.id === "email" || pref.id === "chat"} />
                  <Label htmlFor={`pref-${pref.id}`}>{pref.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Call</CardTitle>
            <CardDescription>Schedule a call with your dedicated specialist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Button variant="outline" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Call
              </Button>
              
              <div className="flex items-center">
                <Checkbox 
                  id="scheduled-call" 
                  checked={scheduledCall}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setScheduledCall(checked);
                    }
                  }}
                />
                <Label htmlFor="scheduled-call" className="ml-2">
                  I've scheduled my onboarding call
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-ai-cyan mr-3" />
                <div>
                  <h3 className="font-medium">Response Time Guarantee</h3>
                  <p className="text-sm text-muted-foreground">We respond to all inquiries within 2 business hours</p>
                </div>
              </div>
              
              <Button variant="outline" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline">Back to Training</Button>
        <Link to="/">
          <Button>Complete Onboarding</Button>
        </Link>
      </div>
    </div>
  );
};

export default SupportSetup;
