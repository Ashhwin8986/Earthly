import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, confirmPassword: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, confirmPassword: string, username: string) => {
    if (!email || !password || !confirmPassword || !username) {
      return { error: { message: 'All fields are required' } };
    }

    if (password !== confirmPassword) {
      return { error: { message: 'Passwords do not match' } };
    }

    // ✅ Check username existence safely
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Profile check failed:', profileError);
      return { error: { message: 'Failed to check username availability' } };
    }

    if (existingProfile) {
      return { error: { message: 'Username already exists' } };
    }

    const redirectUrl = `${window.location.origin}/`;

    // ✅ Create the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username },
      },
    });

    if (signUpError) {
      console.error('Signup failed:', signUpError);
      return { error: signUpError };
    }

    // ✅ Insert into profiles table after successful signup
    if (signUpData?.user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        username,
        email,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Profile insert failed:', insertError);
        // Still return success; auth worked, profile insert can be retried or handled by trigger
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, session, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
