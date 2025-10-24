import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import WaitlistModal from "./WaitlistModal";

const Pricing = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const openWaitlist = () => {
    setIsWaitlistOpen(true);
  };

  const plans = [
    {
      name: "Starter",
      price: "$299",
      period: "month",
      features: [
        "Perfect for: Small teams and startups (1-5 users)",
        "100 enriched Leads",
        "Deep research on enriched leads",
        "10,000 personalized emails", 
        "100 AI voice calls",
        "2 Power Users + 1 Admin",
        "Core integrations",
        "Automated 8-touch multi-channel outreach cadence"
      ]
    },
    {
      name: "Growth", 
      price: "$699",
      period: "month",
      features: [
        "Perfect for: Growing sales teams (10-30 users)",
        "500 enriched leads",
        "Deep research on enriched leads",
        "50,000 personalized emails",
        "500 AI voice calls", 
        "5 Power Users + 2 Admins",
        "All integrations + API access",
        "Priority support",
        "Self-optimizing multi-channel outreach"
      ]
    },
    {
      name: "Scale",
      price: "$1,499", 
      period: "month",
      features: [
        "Perfect for: Established sales organizations (30-100 users)",
        "15,000 enriched leads",
        "Deep research on enriched leads",
        "150,000 personalized emails",
        "2,000 AI voice calls",
        "15 Power Users + 5 Admins",
        "Custom workflows",
        "Dedicated success manager",
        "SLA guarantees",
        "Self-optimizing multi-channel outreach"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom Pricing",
      period: "",
      features: [
        "Perfect for: Teams of 15+",
        "50,000+ enriched leads",
        "Deep research on enriched leads",
        "500,000+ personalized emails",
        "10,000+ AI voice calls",
        "Custom Power User allocation",
        "Unlimited admins",
        "Advanced security (SSO, SAML)",
        "Custom features"
      ]
    }
  ];

  return (
    <>
      <section id="pricing" className="py-20 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }}>
        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-12 leading-tight font-space-grotesk" style={{ color: '#E6EDF4' }}>
              Affordable Plans for Every Business
            </h2>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden backdrop-blur-sm rounded-2xl hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: '#16202A', borderColor: '#3A4656', borderWidth: '1px' }}
              >
                <CardHeader className="text-center p-8 pb-6">
                  <CardTitle className="text-2xl font-bold mb-6 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                    {plan.name}
                  </CardTitle>
                  <div className="mb-8">
                    <span className="text-3xl lg:text-5xl font-bold font-space-grotesk leading-tight" style={{ color: '#E6EDF4' }}>{plan.price}</span>
                    {plan.period && <span className="ml-1 font-inter" style={{ color: '#B9C5D1' }}>/{plan.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#00C8FF' }}></div>
                        <span className="font-inter leading-relaxed" style={{ color: '#B9C5D1' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={openWaitlist}
                    className="w-full py-3 text-base font-semibold bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white border-0 rounded-lg transition-all duration-200 font-space-grotesk"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <WaitlistModal
        open={isWaitlistOpen}
        onOpenChange={setIsWaitlistOpen}
      />
    </>
  );
};

export default Pricing;