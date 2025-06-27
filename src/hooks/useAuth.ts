import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/sanitization';
import { handleError, getSupabaseErrorMessage } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface UserRole {
  role: 'user' | 'manager' | 'admin';
}

// Security cleanup utility
const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to cleanup auth state:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            try {
              // Get profile data using the new RLS policies
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profileData) {
                setProfile(profileData);
              }
              
              // Get user role directly from user_roles table
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (roleData) {
                console.log('User role found:', roleData.role);
                setUserRole(roleData.role);
              } else {
                console.log('No role found, defaulting to user');
                setUserRole('user');
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              handleError(getSupabaseErrorMessage(error), toast);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUserRole('user');
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validate input
      if (!email || !password) {
        toast({
          title: "Validatie fout",
          description: "Email en wachtwoord zijn verplicht",
          variant: "destructive"
        });
        return false;
      }

      if (!validateEmail(email)) {
        toast({
          title: "Validatie fout", 
          description: "Ongeldig email formaat",
          variant: "destructive"
        });
        return false;
      }

      // Clean up existing state before login
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Failed to sign out before login:', err);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Inlog fout",
          description: getSupabaseErrorMessage(error),
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      handleError(getSupabaseErrorMessage(error), toast);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Failed to sign out:', err);
      }
      
      // Reset state
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole('user');
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      handleError('Fout bij uitloggen', toast);
    }
  };

  return {
    user,
    session,
    profile,
    userRole,
    loading,
    login,
    signOut,
    isAuthenticated: !!user,
    isManager: userRole === 'manager' || userRole === 'admin',
    isAdmin: userRole === 'admin'
  };
};
