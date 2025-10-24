
import { Card, CardContent } from "@/components/ui/card";
import { X, Check, TrendingUp, Users, Clock, Shield, Settings } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    {
      icon: TrendingUp,
      title: "High Costs",
      description: "Sales teams require expensive hiring, training, and ongoing management"
    },
    {
      icon: Settings,
      title: "Complex Setup",
      description: "Traditional automation tools need months of setup and technical expertise"
    },
    {
      icon: Clock,
      title: "Inconsistent Results",
      description: "Different reps deliver varying pitches with unpredictable outcomes"
    }
  ];

  const solutions = [
    {
      icon: TrendingUp,
      title: "Automated Efficiency",
      description: "AI agents work 24/7 across unlimited territories"
    },
    {
      icon: Settings,
      title: "Instant Deployment",
      description: "Launch in minutes with zero technical setup required"
    },
    {
      icon: Clock,
      title: "Consistent Excellence",
      description: "Every interaction delivers your perfect pitch"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-ai-midnight mb-6 font-space-grotesk">
            The Business to Business Sales Problem
          </h2>
          <p className="text-xl text-ai-gray max-w-3xl mx-auto font-inter">
            Traditional sales methods are becoming increasingly expensive, inefficient, and unwelcome. 
            It's time for a digital transformation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Problems */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-ai-midnight rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">Traditional Challenges</h3>
            </div>
            
            {problems.map((problem, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-ai-midnight rounded-lg flex items-center justify-center flex-shrink-0">
                      <problem.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-ai-midnight mb-2 font-space-grotesk">
                        {problem.title}
                      </h4>
                      <p className="text-ai-gray font-inter">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-ai-cyan rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">The MASS Solution</h3>
            </div>
            
            {solutions.map((solution, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-ai-cyan rounded-lg flex items-center justify-center flex-shrink-0">
                      <solution.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-ai-midnight mb-2 font-space-grotesk">
                        {solution.title}
                      </h4>
                      <p className="text-ai-gray font-inter">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
