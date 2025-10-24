
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    employees: "",
    service: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    
    toast({
      title: "Thank you for your interest!",
      description: "We'll get back to you within 24 hours to discuss how we can help grow your business.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      employees: "",
      service: "",
      message: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-muted-foreground">
              Get a free consultation and discover how we can help you achieve your goals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Get Your Free Consultation</CardTitle>
                <CardDescription>
                  Tell us about your business and we'll show you how to accelerate growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Select onValueChange={(value) => handleChange("employees", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-100">51-100</SelectItem>
                          <SelectItem value="100+">100+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="service">Service Interest</Label>
                    <Select onValueChange={(value) => handleChange("service", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="What interests you most?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                        <SelectItem value="automation">Business Automation</SelectItem>
                        <SelectItem value="consulting">Growth Consulting</SelectItem>
                        <SelectItem value="technology">Technology Solutions</SelectItem>
                        <SelectItem value="all">All Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell us about your business goals</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="What challenges are you facing? What growth goals do you have?"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-ocean-blue to-coral-red hover:from-ocean-blue/90 hover:to-coral-red/90 py-3"
                  >
                    Get Your Free Consultation
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Why Choose SMB Growth Partners?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-ocean-blue to-coral-red rounded-full mt-2 mr-3"></div>
                      <span className="text-muted-foreground">Specialized in small-medium business growth</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-ocean-blue to-coral-red rounded-full mt-2 mr-3"></div>
                      <span className="text-muted-foreground">Proven track record with 500+ businesses</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-ocean-blue to-coral-red rounded-full mt-2 mr-3"></div>
                      <span className="text-muted-foreground">Customized solutions for your industry</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-ocean-blue to-coral-red rounded-full mt-2 mr-3"></div>
                      <span className="text-muted-foreground">Ongoing support and optimization</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-warm-beige/10 to-ocean-blue/5">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Free Business Growth Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Get a detailed analysis of your growth opportunities
                  </p>
                  <div className="text-3xl font-bold text-primary mb-2">$500 Value</div>
                  <div className="text-sm text-muted-foreground">Absolutely Free - No Commitment</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
