import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, MessageSquare, Search, BarChart3, Users, Target, Sparkles } from "lucide-react";
const AIIntelligence = () => {
  const aiModels = [{
    icon: Brain,
    title: "Strategy Agent",
    models: ["Mistral 3B"],
    description: "Its own dedicated 3B model fine-tuned on elite SDR strategic decision-making patterns, deal prioritization, and account planning methodologies",
    color: "bg-ai-purple",
    tasks: ["Deal strategy optimization", "Pipeline prioritization", "Strategic account planning"],
    training: "Strategic Sales Data"
  }, {
    icon: MessageSquare,
    title: "Conversation Agent",
    models: ["Mistral 3B"],
    description: "Its own dedicated 3B model fine-tuned on thousands of winning sales conversations, objection handling, and top-performer communication patterns",
    color: "bg-ai-cyan",
    tasks: ["Personalized outreach", "Email composition", "Objection handling"],
    training: "Conversation Data"
  }, {
    icon: Zap,
    title: "Qualification Agent",
    models: ["Mistral 3B"],
    description: "Its own dedicated 3B model fine-tuned on lead scoring patterns from top-performing SDRs and qualification methodologies that drive conversions",
    color: "bg-ai-midnight",
    tasks: ["Lead qualification", "ICP matching", "Prospect scoring"],
    training: "Qualification Data"
  }, {
    icon: Search,
    title: "Research Agent",
    models: ["Mistral 3B"],
    description: "Its own dedicated 3B model fine-tuned on prospect intelligence gathering, competitive research, and account analysis from successful sales campaigns",
    color: "bg-ai-purple",
    tasks: ["Company research", "Prospect intelligence", "Competitive analysis"],
    training: "Research Data"
  }, {
    icon: BarChart3,
    title: "Analytics Agent",
    models: ["Mistral 3B"],
    description: "Its own dedicated 3B model fine-tuned on sales performance patterns, pipeline analytics, and optimization strategies from high-performing teams",
    color: "bg-ai-cyan",
    tasks: ["Performance analytics", "Pattern recognition", "Predictive insights"],
    training: "Analytics Data"
  }];
  return <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-ai-midnight mb-6 font-space-grotesk">
            Specialized AI Agents, Not One-Size-Fits-All
          </h2>
          <p className="text-xl text-ai-gray max-w-4xl mx-auto font-inter mb-4">
            Each agent runs its own fine-tuned 3B parameter model—small, fast, and laser-focused on its role.
            Like having 5 expert specialists instead of 1 generalist trying to do everything.
          </p>
          <p className="text-lg text-ai-gray/80 max-w-3xl mx-auto font-inter">
            Not generic AI trained on random internet data. Each model is fine-tuned specifically on proven sales methodologies 
            and elite SDR performance patterns for its dedicated role.
          </p>
        </div>

        {/* Why Small Models Callout */}
        <div className="mb-16 bg-gradient-to-r from-ai-purple/10 to-ai-cyan/10 border border-ai-purple/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-7 w-7 text-ai-cyan" />
            <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">
              Why Multiple Small Models Beat One Large Model
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-ai-cyan" />
                <h4 className="font-bold text-ai-midnight font-space-grotesk">Faster Responses</h4>
              </div>
              <p className="text-sm text-ai-gray font-inter">
                3B parameter models respond in milliseconds, not seconds. Better user experience for your team.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-ai-purple" />
                <h4 className="font-bold text-ai-midnight font-space-grotesk">Specialized Expertise</h4>
              </div>
              <p className="text-sm text-ai-gray font-inter">
                Each model is an expert at ONE thing. Like hiring specialists, not generalists.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-ai-cyan" />
                <h4 className="font-bold text-ai-midnight font-space-grotesk">Lower Costs</h4>
              </div>
              <p className="text-sm text-ai-gray font-inter">
                Smaller models mean more affordable AI that scales with your business.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-ai-purple" />
                <h4 className="font-bold text-ai-midnight font-space-grotesk">Privacy & Control</h4>
              </div>
              <p className="text-sm text-ai-gray font-inter">
                Efficient models that can run independently with better data control.
              </p>
            </div>
          </div>
        </div>

        {/* AI Models Grid */}
        

        {/* Comparison Section */}
        <div className="mb-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">❌</span>
              <h3 className="text-xl font-bold text-ai-gray font-space-grotesk">
                Traditional Approach
              </h3>
            </div>
            <p className="text-ai-gray/80 font-inter mb-4">
              One large general-purpose AI trying to handle everything:
            </p>
            <ul className="space-y-2 text-sm text-ai-gray/70 font-inter">
              <li>• Slower response times</li>
              <li>• Generic outputs across all tasks</li>
              <li>• Higher costs per interaction</li>
              <li>• Jack of all trades, master of none</li>
              <li>• Trained on random internet data</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 border border-ai-cyan/30 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">✅</span>
              <h3 className="text-xl font-bold text-ai-midnight font-space-grotesk">
                MASS Approach
              </h3>
            </div>
            <p className="text-ai-gray font-inter mb-4">
              Multiple specialized 3B models, each an expert in their domain:
            </p>
            <ul className="space-y-2 text-sm text-ai-gray font-inter">
              <li>• Lightning-fast responses</li>
              <li>• Specialized expertise per function</li>
              <li>• Cost-efficient scaling</li>
              <li>• Master of specific sales roles</li>
              <li>• Fine-tuned on elite sales performance data</li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-ai-cyan to-ai-purple rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4 font-space-grotesk">
            5 Specialized Models, Not 1 Generic AI
          </h3>
          <p className="text-lg text-white/90 max-w-4xl mx-auto font-inter">
            Just like you wouldn't hire one person to do research, qualification, outreach, strategy, and analytics—we don't use one AI for everything. 
            Each agent runs its own fine-tuned Mistral 3B model, trained specifically on elite SDR performance patterns and proven sales methodologies. 
            Not generic internet data—real sales excellence.
          </p>
        </div>
      </div>
    </section>;
};
export default AIIntelligence;