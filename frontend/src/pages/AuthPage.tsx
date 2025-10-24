import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Mail } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { validatePassword } from "@/utils/passwordValidation";
import ProductDemo from "@/components/ProductDemo";
import whiteLogo from "@/assets/white-logo.png";

type ViewMode = 'signin' | 'signup' | 'forgot-password' | 'verification-sent';

const AuthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('signin');
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        navigate("/squad");
      }
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (session?.user) {
        setUser(session.user);
        // Auto-login after email verification
        if (event === 'SIGNED_IN') {
          navigate("/squad");
        }
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const getAuthErrorMessage = (error: any): string => {
    const message = error?.message || '';

    if (message.includes('Email not confirmed')) {
      return 'Please verify your email before signing in. Check your inbox for the verification link.';
    }
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('Email rate limit exceeded')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('User already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 8 characters with letters and numbers.';
    }

    return message || 'An unexpected error occurred';
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/squad`
        }
      });
      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPasswordErrors([]);

    try {
      // Validate password
      const validation = validatePassword(password);
      if (!validation.isValid) {
        const errors = Object.values(validation.errors).filter(Boolean) as string[];
        setPasswordErrors(errors);
        setLoading(false);
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      console.log('Attempting sign-up for:', email);

      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/squad`
        }
      });

      console.log('Sign-up response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        setError(getAuthErrorMessage(error));
        toast({
          title: "Sign Up Error",
          description: getAuthErrorMessage(error),
          variant: "destructive"
        });
      } else {
        console.log('Sign-up successful, verification email sent');
        setViewMode('verification-sent');
        toast({
          title: "Check your email",
          description: `We've sent a verification link to ${email}. Please verify your email to continue.`,
        });
      }
    } catch (err: any) {
      console.error('Unexpected error during sign-up:', err);
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('Attempting sign-in for:', email);

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign-in response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        const errorMessage = getAuthErrorMessage(error);
        setError(errorMessage);
        toast({
          title: "Sign In Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('Sign-in successful');
        // Navigation will happen via onAuthStateChange
      }
    } catch (err: any) {
      console.error('Unexpected error during sign-in:', err);
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setError(getAuthErrorMessage(error));
        toast({
          title: "Error",
          description: getAuthErrorMessage(error),
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: `We've sent a password reset link to ${email}`,
        });
        setViewMode('signin');
      }
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        toast({
          title: "Error",
          description: getAuthErrorMessage(error),
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email sent",
          description: "Verification email has been resent. Please check your inbox.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: getAuthErrorMessage(err),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }}>
        {/* Logo in top left */}
        <div className="absolute top-8 left-8">
          <img src={whiteLogo} alt="Logo" className="h-20 w-auto" />
        </div>

        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1E78FF] via-[#00C8FF] to-[#1E78FF]"></div>

        <div className="w-full max-w-md space-y-8 mt-32">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-space-grotesk" style={{
              background: 'linear-gradient(90deg, #1E78FF 0%, #00C8FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {viewMode === 'signup' && 'Create your account'}
              {viewMode === 'signin' && 'Welcome back!'}
              {viewMode === 'forgot-password' && 'Reset password'}
              {viewMode === 'verification-sent' && 'Check your email'}
            </h1>
            <p className="font-inter" style={{ color: '#B9C5D1' }}>
              {viewMode === 'signup' && 'Join us and grow your pipeline faster.'}
              {viewMode === 'signin' && 'Go to market in minutes, not weeks.'}
              {viewMode === 'forgot-password' && 'Enter your email to receive a password reset link.'}
              {viewMode === 'verification-sent' && `We sent a verification link to ${email}`}
            </p>
          </div>

          {viewMode === 'verification-sent' ? (
            // Verification Sent View
            <div className="space-y-6">
              <Alert style={{ backgroundColor: '#00C8FF20', borderColor: '#00C8FF' }}>
                <AlertDescription className="font-inter text-sm" style={{ color: '#00C8FF' }}>
                  Please click the link in your email to verify your account. After verification, you'll be automatically logged in.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleResendVerification}
                disabled={loading}
                variant="outline"
                className="w-full h-12"
                style={{
                  borderColor: '#3A4656',
                  backgroundColor: '#16202A',
                  color: '#E6EDF4'
                }}
              >
                {loading ? "Sending..." : "Resend verification email"}
              </Button>

              <p className="text-center text-sm font-inter" style={{ color: '#A7B4C2' }}>
                <button
                  onClick={() => setViewMode('signin')}
                  className="font-medium transition-colors"
                  style={{ color: '#00C8FF' }}
                >
                  Back to sign in
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* Google Sign In - Only show for sign in/sign up, not forgot password */}
              {viewMode !== 'forgot-password' && (
                <>
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full h-12 font-medium flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: '#3A4656',
                      backgroundColor: '#16202A',
                      color: '#E6EDF4'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00C8FF';
                      e.currentTarget.style.backgroundColor = '#253241';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3A4656';
                      e.currentTarget.style.backgroundColor = '#16202A';
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: '#3A4656' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 font-inter" style={{ backgroundColor: '#0A0E12', color: '#6F8091' }}>OR</span>
                    </div>
                  </div>
                </>
              )}

              {/* Sign Up Form */}
              {viewMode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 transition-all"
                      style={{
                        borderColor: '#3A4656',
                        backgroundColor: '#16202A',
                        color: '#E6EDF4'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1E78FF';
                        e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#3A4656';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00C8FF' }} />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-10 transition-all"
                        style={{
                          borderColor: '#3A4656',
                          backgroundColor: '#16202A',
                          color: '#E6EDF4'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1E78FF';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#3A4656';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="Password"
                    required
                    showStrength
                    error={passwordErrors[0]}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1E78FF';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#3A4656';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Confirm password"
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1E78FF';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#3A4656';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  {error && (
                    <Alert variant="destructive" style={{ backgroundColor: '#FF3B3B20', borderColor: '#FF3B3B' }}>
                      <AlertDescription className="font-inter text-sm" style={{ color: '#FF3B3B' }}>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-medium text-base transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                    style={{
                      backgroundColor: '#00C8FF',
                      color: '#0A0E12',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E78FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#00C8FF';
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 font-semibold">{loading ? "Creating account..." : "Create Account"}</span>
                  </Button>
                </form>
              )}

              {/* Sign In Form */}
              {viewMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00C8FF' }} />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-10 transition-all"
                        style={{
                          borderColor: '#3A4656',
                          backgroundColor: '#16202A',
                          color: '#E6EDF4'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1E78FF';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#3A4656';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="Password"
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1E78FF';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#3A4656';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  {error && (
                    <Alert variant="destructive" style={{ backgroundColor: '#FF3B3B20', borderColor: '#FF3B3B' }}>
                      <AlertDescription className="font-inter text-sm" style={{ color: '#FF3B3B' }}>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-medium text-base transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                    style={{
                      backgroundColor: '#00C8FF',
                      color: '#0A0E12',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E78FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#00C8FF';
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 font-semibold">{loading ? "Signing in..." : "Sign In"}</span>
                  </Button>

                  {/* Forgot Password Link */}
                  <p className="text-center text-sm font-inter" style={{ color: '#A7B4C2' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot-password');
                        setError("");
                        setPassword("");
                      }}
                      className="font-medium transition-colors"
                      style={{ color: '#00C8FF' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1E78FF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#00C8FF';
                      }}
                    >
                      Forgot password?
                    </button>
                  </p>
                </form>
              )}

              {/* Forgot Password Form */}
              {viewMode === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00C8FF' }} />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-10 transition-all"
                        style={{
                          borderColor: '#3A4656',
                          backgroundColor: '#16202A',
                          color: '#E6EDF4'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1E78FF';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #1E78FF';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#3A4656';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" style={{ backgroundColor: '#FF3B3B20', borderColor: '#FF3B3B' }}>
                      <AlertDescription className="font-inter text-sm" style={{ color: '#FF3B3B' }}>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-medium text-base transition-all hover:scale-[1.02] shadow-lg relative overflow-hidden group"
                    style={{
                      backgroundColor: '#00C8FF',
                      color: '#0A0E12',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E78FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#00C8FF';
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 font-semibold">{loading ? "Sending..." : "Send Reset Link"}</span>
                  </Button>
                </form>
              )}

              {/* Toggle Sign In / Sign Up */}
              {viewMode !== 'forgot-password' && (
                <p className="text-center text-sm font-inter" style={{ color: '#A7B4C2' }}>
                  {viewMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{" "}
                  <button
                    onClick={() => {
                      setViewMode(viewMode === 'signup' ? 'signin' : 'signup');
                      setError("");
                      setPassword("");
                      setConfirmPassword("");
                      setPasswordErrors([]);
                    }}
                    className="font-medium transition-colors"
                    style={{ color: '#00C8FF' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1E78FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#00C8FF';
                    }}
                  >
                    {viewMode === 'signup' ? 'Sign in' : 'Sign up'}
                  </button>
                </p>
              )}

              {/* Back to Sign In from Forgot Password */}
              {viewMode === 'forgot-password' && (
                <p className="text-center text-sm font-inter" style={{ color: '#A7B4C2' }}>
                  <button
                    onClick={() => {
                      setViewMode('signin');
                      setError("");
                    }}
                    className="font-medium transition-colors"
                    style={{ color: '#00C8FF' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1E78FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#00C8FF';
                    }}
                  >
                    Back to sign in
                  </button>
                </p>
              )}

              {/* Footer Links */}
              <div className="flex items-center justify-center gap-6 text-sm font-inter" style={{ color: '#6F8091' }}>
                <a
                  href="#"
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00C8FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6F8091';
                  }}
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00C8FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6F8091';
                  }}
                >
                  Privacy Policy
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column - Product Demo */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: '#1E78FF20' }}></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: '#00C8FF15', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: '#1E78FF10', animationDelay: '0.5s' }}></div>
        </div>

        {/* Product Demo */}
        <div className="relative z-10 w-full h-full">
          <ProductDemo />
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }

            .animate-float {
              animation: float 3s ease-in-out infinite;
            }

            .animate-float-delayed {
              animation: float 3s ease-in-out infinite 1s;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AuthPage;
