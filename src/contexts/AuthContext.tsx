"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { linkGuestOrders } from '@/services/api';

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, phone: string, address: string) => Promise<{ user: any, session: any } | null>;
    convertGuestToPermanent: (email: string, password: string, fullName: string, phone: string, address: string) => Promise<{ user: any, session: any }>;
    signInAnonymously: () => Promise<{ user: any, session: any }>;
    logout: () => void;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
            // Check if user is anonymous from JWT
            const { data: { session } } = await supabase.auth.getSession();
            const isAnonymous = session?.user?.is_anonymous || false;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            setUser({
                id,
                email,
                name: profile?.full_name || email.split('@')[0],
                role: (profile?.role || '').toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER,
                phone: profile?.phone,
                address: profile?.address,
                isAnonymous // Add flag to detect anonymous users
            });
        } catch (e) {
            // If profile fetch fails, user might exist in Auth but not in Profiles table yet
            console.error("Error fetching profile:", e);
            console.error("AuthContext: Error fetching profile for user", id, e);
            // FALLBACK: Default to USER role if profile cannot be fetched.
            // This prevents the app from crashing but might restrict access incorrectly if DB is unreachable.
            setUser({ id, email, name: email.split('@')[0], role: UserRole.USER, isAnonymous: false });
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

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signup = async (email: string, password: string, fullName: string, phone: string, address: string): Promise<{ user: any, session: any } | null> => {
        // The Database Trigger 'handle_new_user' will read this metadata and create the profile row.
        const { data, error } = await supabase.auth.signUp({
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

        // Automatically link any guest orders with this email to the new account
        if (data.user) {
            try {
                const linkedCount = await linkGuestOrders(data.user.id, email);
                if (linkedCount > 0) {
                    console.log(`✅ Linked ${linkedCount} guest order(s) to new account`);
                }
            } catch (linkError) {
                console.error('Failed to link guest orders:', linkError);
                // Don't throw - signup was successful, order linking is a bonus feature
            }
        }

        return { user: data.user, session: data.session };
    };

    const convertGuestToPermanent = async (email: string, password: string, fullName: string, phone: string, address: string) => {
        // Logic for conversion usually involves updating the user. 
        // Supabase's signInAnonymously integration with conversion is tricky.
        // Often strictly involves standard signup/updateUser if already authenticated.
        // Assuming for now it's just a signup/update flow.
        const { data, error } = await supabase.auth.updateUser({
            email,
            password,
            data: {
                full_name: fullName,
                phone,
                address
            }
        });
        if (error) throw error;
        return { user: data.user, session: null }; // Session handling might varry
    };

    const signInAnonymously = async () => {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return { user: data.user, session: data.session };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            convertGuestToPermanent,
            signInAnonymously,
            logout,
            isLoading,
            refreshProfile,
            updatePassword,
            resetPassword
        }}>
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
