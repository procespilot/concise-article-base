
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/sanitization';
import { handleError, getSupabaseErrorMessage } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, forceLogout } from './useAuthCleanup';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface UserRole {
  role: 'user' | 'manager' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Track active fetch operations to prevent race conditions
  const activeFetchRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Memoized role fetching with race condition prevention
  const fetchUserRole = useCallback(async (userId: string, callId: string) => {
    console.log(`=== [${callId}] Starting role fetch for user:`, userId);
    
    // Set this as the active fetch
    activeFetchRef.current = callId;
    
    try {
      // Direct query to user_roles table
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no role exists

      console.log(`=== [${callId}] Role query result:`, { roleData, error });

      // Check if this call is still the active one
      if (activeFetchRef.current !== callId) {
        console.log(`=== [${callId}] Call superseded, ignoring result`);
        return null;
      }

      if (error) {
        console.error(`=== [${callId}] Error fetching user role:`, error);
        return 'user';
      }

      if (roleData) {
        console.log(`=== [${callId}] Role found:`, roleData.role);
        return roleData.role;
      }

      // No role found, create default user role
      console.log(`=== [${callId}] No role found, creating default user role`);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'user' });
      
      if (insertError) {
        console.error(`=== [${callId}] Error creating default role:`, insertError);
      }
      
      return 'user';
    } catch (error) {
      console.error(`=== [${callId}] Exception in fetchUserRole:`, error);
      return 'user';
    }
  }, []);

  // Consolidated user data fetching function
  const fetchUserData = useCallback(async (userId: string, callId: string) => {
    if (!mountedRef.current) return;
    
    console.log(`=== [${callId}] Fetching user data for:`, userId);
    
    try {
      // Fetch profile and role in sequence to avoid conflicts
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log(`=== [${callId}] Profile query result:`, { profileData, profileError });

      if (profileError) {
        console.error(`=== [${callId}] Profile error:`, profileError);
      } else if (profileData && mountedRef.current) {
        console.log(`=== [${callId}] Profile loaded:`, profileData);
        setProfile(profileData);
      }
      
      // Fetch role after profile
      const role = await fetchUserRole(userId, callId);
      
      // Only update if this is still the active call and component is mounted
      if (mountedRef.current && activeFetchRef.current === callId && role !== null) {
        console.log(`=== [${callId}] Setting role to:`, role);
        setUserRole(role);
      }
      
    } catch (error) {
      console.error(`=== [${callId}] Error fetching user data:`, error);
      if (mountedRef.current) {
        handleError(getSupabaseErrorMessage(error), toast);
      }
    }
  }, [fetchUserRole, toast]);

  // Force refresh user data with race condition prevention
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    const callId = `refresh-${Date.now()}`;
    console.log(`=== [${callId}] Refreshing user data for:`, user.id);
    
    await fetchUserData(user.id, callId);
  }, [user, fetchUserData]);

  useEffect(() => {
    mountedRef.current = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const eventCallId = `auth-${event}-${Date.now()}`;
        console.log(`=== [${eventCallId}] Auth state change:`, event, session?.user?.id);
        
        if (!mountedRef.current) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            if (!mountedRef.current) return;
            await fetchUserData(session.user.id, eventCallId);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            setProfile(null);
            setUserRole('user');
            activeFetchRef.current = null; // Clear active fetch
          }
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initCallId = `init-${Date.now()}`;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      
      console.log(`=== [${initCallId}] Initial session:`, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id, initCallId);
      }
      
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      activeFetchRef.current = null;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

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
      console.log('=== Starting logout process');
      
      // Clear active fetch operations
      activeFetchRef.current = null;
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt multiple logout strategies
      const logoutStrategies = [
        () => supabase.auth.signOut({ scope: 'global' }),
        () => supabase.auth.signOut({ scope: 'local' }),
        () => supabase.auth.signOut()
      ];

      let logoutSuccess = false;
      for (const strategy of logoutStrategies) {
        try {
          await strategy();
          logoutSuccess = true;
          console.log('=== Logout strategy succeeded');
          break;
        } catch (err) {
          console.warn('=== Logout strategy failed:', err);
          continue;
        }
      }
      
      // Reset state regardless of logout success
      if (mountedRef.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setUserRole('user');
      }
      
      // Show success message only after successful logout
      if (logoutSuccess) {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd"
        });
      }
      
      // Force page reload for complete cleanup
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('=== Critical logout error:', error);
      // Force logout even on error
      toast({
        title: "Uitgelogd", 
        description: "Je bent uitgelogd (geforceerd)"
      });
      forceLogout();
    }
  };

  const isManager = userRole === 'manager' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  console.log('=== useAuth state:', { 
    userRole, 
    isManager, 
    isAdmin,
    userId: user?.id,
    activeFetch: activeFetchRef.current
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
