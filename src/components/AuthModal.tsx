
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
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              referred_by: referralCode,
            },
          },
        });
        if (error) {
          // Handle specific database errors
          if (error.message.includes('Database error saving new user') || 
              error.message.includes('generate_referral_code') ||
              error.message.includes('function') && error.message.includes('does not exist')) {
            throw new Error('Registration is temporarily unavailable. Please try again later or contact support.');
          }
          throw error;
        }
        toast({ 
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.'
        });
      }
      onClose();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
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
