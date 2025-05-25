
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, referralCode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: 'Welcome back!' });
        onClose();
      } else {
        // For signup, create user with metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'User',
              phone: phone || null,
              referred_by: referralCode || null,
            },
          },
        });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        if (data.user) {
          toast({ 
            title: 'Account created successfully!',
            description: 'You can now start using the app!'
          });
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Try logging in instead.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Database error saving new user')) {
        errorMessage = 'Registration is temporarily unavailable. Please try again later or contact support.';
      } else if (error.message?.includes('temporarily unavailable')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'Google authentication is not properly configured. Please contact support.';
      }
      
      toast({
        title: 'Google Sign-In Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Facebook auth error:', error);
      let errorMessage = 'Failed to sign in with Facebook. Please try again.';
      
      if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'Facebook authentication is not properly configured. Please contact support.';
      }
      
      toast({
        title: 'Facebook Sign-In Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? '🎰 Welcome Back!' : '🎯 Join the Fun!'}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-center">
            {isLogin ? 'Sign in to start spinning and earning coins!' : 'Create your account and start earning coins today!'}
          </DialogDescription>
        </DialogHeader>

        {/* Email/Password Form - Primary Method */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
              />
              <Input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
              />
            </>
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder-white/70"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder-white/70"
          />

          {referralCode && !isLogin && (
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-sm">🎁 Referred by: <span className="font-bold">{referralCode}</span></p>
              <p className="text-xs text-white/80">You'll get 50 bonus coins!</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3"
          >
            {loading ? '⏳ Please wait...' : isLogin ? '🚀 Login' : '🎉 Create Account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-br from-purple-600 to-pink-600 px-2 text-white/70">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons - Alternative Methods */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={handleFacebookAuth}
            disabled={loading}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-3 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/80 hover:text-white underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
