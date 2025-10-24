
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Shield, Lock, CreditCard, Check, HelpCircle, Globe, X } from "lucide-react";

interface CheckoutData {
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  price: string;
  discount_applied?: string;
  user_email?: string;
  checkout_link?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: CheckoutData | null;
}

const CheckoutModal = ({ isOpen, onClose, checkoutData }: CheckoutModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (checkoutData?.user_email) {
      setEmail(checkoutData.user_email);
    }
  }, [checkoutData]);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      if (checkoutData?.checkout_link) {
        window.open(checkoutData.checkout_link, '_blank');
      } else {
        console.log('Creating Stripe checkout session...', {
          plan: checkoutData?.plan_name,
          billing: checkoutData?.billing_cycle,
          email: email
        });
        
        setTimeout(() => {
          window.open('/payment-success', '_blank');
        }, 1000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData) {
    return null;
  }

  const planPrices = {
    'Basic': { monthly: '$599', annual: '$5,990' },
    'Scale': { monthly: '$1,599', annual: '$15,990' },
    'Enterprise': { monthly: '$3,999', annual: '$39,990' }
  };

  const currentPrice = planPrices[checkoutData.plan_name as keyof typeof planPrices]?.[checkoutData.billing_cycle] || checkoutData.price;
  const setupFee = checkoutData.plan_name === 'Enterprise' ? 'Custom (negotiated)' : '$5,000 (spread over 12 months)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-flow-accent/10 via-flow-neutral to-white p-0">
        <DialogDescription className="sr-only">
          Checkout and payment processing modal
        </DialogDescription>
        <DialogHeader className="px-8 pt-8 pb-4">
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="mb-6 text-flow-primary hover:text-flow-secondary transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Plans
            </Button>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-flow-secondary/10 to-flow-accent/10 text-flow-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Check size={16} />
              You're Almost There!
            </div>
            
            <DialogTitle className="text-3xl md:text-4xl font-bold text-flow-primary mb-4">
              Complete Your <span className="bg-gradient-to-r from-flow-secondary to-flow-accent bg-clip-text text-transparent">Signup</span>
            </DialogTitle>
            
            <p className="text-lg text-flow-primary/70">
              Join thousands of businesses scaling their sales with AI
            </p>
          </div>
        </DialogHeader>

        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-flow-primary flex items-center justify-between">
                  Order Summary
                  <Badge className="bg-flow-accent/20 text-flow-primary">
                    {checkoutData.plan_name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-flow-primary/10">
                  <span className="text-flow-primary font-medium">Plan</span>
                  <span className="text-flow-primary">{checkoutData.plan_name}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-flow-primary/10">
                  <span className="text-flow-primary font-medium">Billing Cycle</span>
                  <span className="text-flow-primary capitalize">{checkoutData.billing_cycle}</span>
                </div>
                
                {checkoutData.discount_applied && (
                  <div className="flex justify-between items-center py-2 border-b border-flow-primary/10">
                    <span className="text-flow-primary font-medium">Discount</span>
                    <span className="text-flow-highlight font-semibold">{checkoutData.discount_applied}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b border-flow-primary/10">
                  <span className="text-flow-primary font-medium">Setup Fee</span>
                  <span className="text-flow-primary text-sm">{setupFee}</span>
                </div>
                
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-flow-secondary/5 to-flow-accent/5 px-4 rounded-2xl">
                  <span className="text-flow-primary font-bold text-lg">Total</span>
                  <span className="text-flow-primary font-bold text-xl">{currentPrice}</span>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                    className="w-full h-12 bg-gradient-to-r from-flow-accent to-flow-secondary hover:from-flow-accent/90 hover:to-flow-secondary/90 text-flow-primary font-bold rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        Complete Checkout
                        <CreditCard size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account & Payment Details */}
            <div className="space-y-6">
              {/* Account Creation */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-flow-primary">Account Details</CardTitle>
                  <CardDescription className="text-flow-primary/60">
                    Create your SIOS account to get started
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-flow-primary mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="rounded-xl border-flow-primary/20 focus:border-flow-accent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-flow-primary mb-2">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="rounded-xl border-flow-primary/20 focus:border-flow-accent"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-flow-primary/20 text-flow-primary hover:bg-flow-accent/10"
                    >
                      Sign up with Google
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Security */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-flow-primary flex items-center gap-2">
                    <Shield size={20} className="text-flow-secondary" />
                    Secure Payment Processing
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-flow-primary/70">
                    <Lock size={16} className="text-flow-secondary" />
                    <span>Your payment is securely processed by Stripe</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-flow-primary/70">
                    <CreditCard size={16} className="text-flow-secondary" />
                    <span>All major credit/debit cards and digital wallets accepted</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-flow-primary/70">
                    <Globe size={16} className="text-flow-secondary" />
                    <span>International payments supported with currency conversion</span>
                  </div>
                  
                  <div className="bg-flow-secondary/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-flow-secondary text-white text-xs">PCI DSS</Badge>
                      <Badge className="bg-flow-accent text-flow-primary text-xs">HTTPS</Badge>
                      <Badge className="bg-flow-highlight text-flow-primary text-xs">Encrypted</Badge>
                    </div>
                    <p className="text-xs text-flow-primary/60">
                      All transactions are thoroughly tested in Stripe's sandbox environment
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Management */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-flow-primary mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-flow-primary/70">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-flow-secondary mt-0.5 flex-shrink-0" />
                      <span>You can manage your subscription and billing details at any time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-flow-secondary mt-0.5 flex-shrink-0" />
                      <span>All charges will appear as "SIOS AI Sales" on your statement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-flow-secondary mt-0.5 flex-shrink-0" />
                      <span>Setup fee is automatically spread over 12 months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-flow-secondary mt-0.5 flex-shrink-0" />
                      <span>Cancel anytime with our 30-day money-back guarantee</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customer Support */}
          <div className="mt-8 text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/40 inline-block">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-full border-flow-primary/20 text-flow-primary hover:bg-flow-accent/10"
                >
                  <HelpCircle size={16} className="mr-2" />
                  Need Help?
                </Button>
                <Button
                  variant="ghost"
                  className="text-flow-secondary hover:text-flow-accent"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 text-center">
            <div className="flex justify-center items-center gap-8 text-xs text-flow-primary/60 flex-wrap">
              <a href="#" className="hover:text-flow-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-flow-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-flow-primary transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
