
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, CheckCircle } from "lucide-react";

const TrustSecurity = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Open-Source Foundation",
      description: "Built on proven open-source models with full transparency—no black-box vendor lock-in",
      details: ["Fine-tuned Mistral models you can inspect", "No dependency on expensive proprietary APIs", "Full visibility into AI decision-making"]
    },
    {
      icon: Lock,
      title: "Data Protection & Privacy",
      description: "Enterprise-grade security meeting GDPR, CCPA, and SOC 2 standards",
      details: ["Your training data stays private and secure", "End-to-end encryption for all communications", "GDPR and CCPA compliant data handling"]
    },
    {
      icon: CheckCircle,
      title: "Enterprise Security",
      description: "Bank-level security infrastructure with role-based access control",
      details: ["SSO and multi-factor authentication", "Role-based access control (RBAC)", "Comprehensive audit logs and monitoring"]
    }
  ];

  const certifications = [
    "SOC 2 Type II",
    "ISO 27001",
    "GDPR Compliant",
    "CCPA Compliant",
    "PCI DSS",
    "HIPAA Ready"
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-ai-midnight mb-6 font-space-grotesk">
            Trust & Security First
          </h2>
          <p className="text-xl text-ai-gray max-w-3xl mx-auto font-inter">
            Built with enterprise-grade security and ethical AI practices. 
            Your data and your customers' trust are our top priorities.
          </p>
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-ai-cyan/20 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-ai-midnight" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-ai-midnight mb-3 font-space-grotesk">
                      {feature.title}
                    </h3>
                    <p className="text-ai-gray mb-4 font-inter">
                      {feature.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-ai-gray font-inter">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustSecurity;
