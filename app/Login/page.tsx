"use client"
import React, { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Alert, AlertDescription } from '../components/alert';
import { useRouter } from 'next/navigation';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }
);

const LeetCodeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!leetcodeUsername) {
      setError('LeetCode username is required for signup');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id, 
            leetcode_username: leetcodeUsername 
          }]);

        if (profileError) throw profileError;
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }

      setSuccessMessage('Account created successfully.');
      setTimeout(() => {
        router.push('/');  // Use router.push() for redirection
      }, 0); 

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setTimeout(() => {
        router.push('/');  // Use router.push() for redirection
      }, 0); 

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    setTimeout(() => {
        router.push('/');  // Use router.push() for redirection
      }, 0); 
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Card className="w-full max-w-md mx-auto mt-8 flex justify-center items-center">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="LeetCode Username"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  required
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
  
export default LeetCodeLogin;