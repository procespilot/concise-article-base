
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

  // Improved role fetching with better error handling
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('=== Fetching role for user:', userId);
      
      // Direct query to user_roles table
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('Role query result:', { roleData, error });

      if (error) {
        console.error('Error fetching user role:', error);
        
        // If no role found, try to create a default user role
        if (error.code === 'PGRST116') {
          console.log('No role found, creating default user role');
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'user' });
          
          if (insertError) {
            console.error('Error creating default role:', insertError);
          }
          return 'user';
        }
        return 'user';
      }

      if (roleData) {
        console.log('Role found:', roleData.role);
        return roleData.role;
      }

      console.log('No role found, defaulting to user');
      return 'user';
    } catch (error) {
      console.error('Exception in fetchUserRole:', error);
      return 'user';
    }
  };

  // Force refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    console.log('=== Refreshing user data for:', user.id);
    
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile refresh result:', { profileData, profileError });

      if (profileData) {
        setProfile(profileData);
      }
      
      // Get user role
      const role = await fetchUserRole(user.id);
      console.log('Setting refreshed role to:', role);
      setUserRole(role);
      
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // Get profile data
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              console.log('Profile query result:', { profileData, profileError });

              if (profileError) {
                console.error('Profile error:', profileError);
              } else if (profileData && mounted) {
                console.log('Profile loaded:', profileData);
                setProfile(profileData);
              }
              
              // Get user role with improved method
              const role = await fetchUserRole(session.user.id);
              if (mounted) {
                console.log('Setting role to:', role);
                setUserRole(role);
              }
              
            } catch (error) {
              console.error('Error fetching user data:', error);
              if (mounted) {
                handleError(getSupabaseErrorMessage(error), toast);
              }
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setProfile(null);
            setUserRole('user');
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('=== Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  const isManager = userRole === 'manager' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  console.log('=== useAuth state:', { 
    userRole, 
    isManager, 
    isAdmin,
    userId: user?.id 
  });

  return {
    user,
    session,
    profile,
    userRole,
    loading,
    login,
    signOut,
    refreshUserData,
    isAuthenticated: !!user,
    isManager,
    isAdmin
  };
};
