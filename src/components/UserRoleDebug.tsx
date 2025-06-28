
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserRoleDebug = () => {
  const { user, userRole, isManager, isAdmin } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [directRoleQuery, setDirectRoleQuery] = useState<any>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) return;

      try {
        console.log('=== DEBUG: Starting role query ===');
        
        // Direct role query
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
          
        console.log('Direct role query result:', { roleData, roleError });
        setDirectRoleQuery({ data: roleData, error: roleError });

        // Profile query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        console.log('Profile query result:', { profileData, profileError });

        // RPC query
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_users_with_roles');
          
        console.log('RPC query result:', { usersData, usersError });

        setDebugInfo({
          roleData,
          roleError: roleError?.message,
          profileData,
          profileError: profileError?.message,
          usersData,
          usersError: usersError?.message
        });
      } catch (error) {
        console.error('Debug fetch error:', error);
        setDebugInfo({ fetchError: error });
      }
    };

    fetchDebugInfo();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug: Niet ingelogd</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Auth State Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Detected Role:</strong> <span className="bg-yellow-200 px-2 py-1">{userRole}</span></p>
            <p><strong>Is Manager:</strong> <span className={isManager ? 'bg-green-200' : 'bg-red-200'}>{isManager ? 'JA' : 'NEE'}</span></p>
            <p><strong>Is Admin:</strong> <span className={isAdmin ? 'bg-green-200' : 'bg-red-200'}>{isAdmin ? 'JA' : 'NEE'}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct Role Query</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(directRoleQuery, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleDebug;
