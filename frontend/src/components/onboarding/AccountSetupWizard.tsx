
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Users, FileSpreadsheet, Link2 } from "lucide-react";

const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  teamSize: z.string(),
  industry: z.string(),
  salesGoals: z.string().min(10, { message: "Please provide more details about your sales goals." }),
  salesProcess: z.string().optional(),
  crmIntegration: z.string().optional(),
});

interface AccountSetupWizardProps {
  onComplete: () => void;
}

const AccountSetupWizard = ({ onComplete }: AccountSetupWizardProps) => {
  const [step, setStep] = useState(1);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      teamSize: "",
      industry: "",
      salesGoals: "",
      salesProcess: "",
      crmIntegration: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    onComplete();
  };

  const steps = [
    {
      title: "Company Profile",
      description: "Tell us about your organization",
      icon: Building,
      fields: ["companyName", "teamSize", "industry"]
    },
    {
      title: "Sales Goals",
      description: "Define what success looks like",
      icon: FileSpreadsheet,
      fields: ["salesGoals"]
    },
    {
      title: "Sales Process",
      description: "Document your current workflow",
      icon: Users,
      fields: ["salesProcess"]
    },
    {
      title: "Integrations",
      description: "Connect your existing tools",
      icon: Link2,
      fields: ["crmIntegration"]
    }
  ];

  const currentStep = steps[step - 1];

  const nextStep = () => {
    const fieldsToValidate = currentStep.fields as Array<keyof z.infer<typeof formSchema>>;
    
    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        if (step < steps.length) {
          setStep(step + 1);
        } else {
          form.handleSubmit(onSubmit)();
        }
      }
    });
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
          <currentStep.icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501+">501+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {step === 2 && (
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="salesGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are your key sales goals?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you want to achieve with our platform..."
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include metrics like lead conversion targets, revenue goals, or customer acquisition costs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {step === 3 && (
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="salesProcess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your current sales process</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Outline your current sales workflow stages..."
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include stages like lead generation, qualification, demo, proposal, negotiation, and closing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {step === 4 && (
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="crmIntegration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM Integration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your CRM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salesforce">Salesforce</SelectItem>
                          <SelectItem value="hubspot">HubSpot</SelectItem>
                          <SelectItem value="zoho">Zoho CRM</SelectItem>
                          <SelectItem value="pipedrive">Pipedrive</SelectItem>
                          <SelectItem value="monday">Monday.com</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        We'll help you connect your CRM system in the next steps.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            <Button 
              type="button"
              onClick={nextStep}
            >
              {step < steps.length ? "Next" : "Complete"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AccountSetupWizard;
