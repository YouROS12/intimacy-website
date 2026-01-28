import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, phone: string, address: string) => Promise<{ user: any, session: any } | null>;
  convertGuestToPermanent: (email: string, password: string, fullName: string, phone: string, address: string) => Promise<{ user: any, session: any }>;
  signInAnonymously: () => Promise<{ user: any, session: any }>;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured in .env. Authentication disabled.");
      setIsLoading(false);
      return;
    }

    // Check active session
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      setUser({
        id,
        email,
        name: profile?.full_name || email.split('@')[0],
        role: profile?.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
        phone: profile?.phone,
        address: profile?.address
      });
    } catch (e) {
      // If profile fetch fails, user might exist in Auth but not in Profiles table yet
      console.error("Error fetching profile:", e);
      setUser({ id, email, name: email.split('@')[0], role: UserRole.USER });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password required");

    const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, fullName: string, phone: string, address: string): Promise<{ user: any, session: any } | null> => {
    // The Database Trigger 'handle_new_user' will read this metadata and create the profile row.
    const { data, error } = await (supabase.auth as any).signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          address: address
        }
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  };

  const signInAnonymously = async () => {
    const { data, error } = await (supabase.auth as any).signInAnonymously();
    if (error) throw error;
    return { user: data.user, session: data.session };
  };

  const logout = async () => {
    await (supabase.auth as any).signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};