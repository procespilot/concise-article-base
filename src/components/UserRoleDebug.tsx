
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserRoleDebug = () => {
  const { user, userRole, isManager, isAdmin } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [directRoleQuery, setDirectRoleQuery] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) return;

      try {
        console.log('=== DEBUG: Starting comprehensive role query ===');
        
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

        // Try to get current user from RPC results
        const currentUserFromRPC = usersData?.find((u: any) => u.id === user.id);
        console.log('Current user from RPC:', currentUserFromRPC);

        setDebugInfo({
          roleData,
          roleError: roleError?.message,
          profileData,
          profileError: profileError?.message,
          usersData,
          usersError: usersError?.message,
          currentUserFromRPC
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
            <p><strong>Detected Role:</strong> <span className="bg-yellow-200 px-2 py-1 rounded">{userRole}</span></p>
            <p><strong>Is Manager:</strong> <span className={`px-2 py-1 rounded ${isManager ? 'bg-green-200' : 'bg-red-200'}`}>{isManager ? 'JA' : 'NEE'}</span></p>
            <p><strong>Is Admin:</strong> <span className={`px-2 py-1 rounded ${isAdmin ? 'bg-green-200' : 'bg-red-200'}`}>{isAdmin ? 'JA' : 'NEE'}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct Role Query Result</CardTitle>
        </CardHeader>
        <CardContent>
          {directRoleQuery?.data && directRoleQuery.data.length > 0 ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Rol gevonden!</p>
              {directRoleQuery.data.map((role: any, index: number) => (
                <div key={index} className="bg-green-50 p-2 rounded">
                  <p><strong>Rol:</strong> {role.role}</p>
                  <p><strong>Aangemaakt:</strong> {new Date(role.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 font-semibold">❌ Geen rol gevonden</p>
              {directRoleQuery?.error && (
                <p className="text-red-500 text-sm">Error: {directRoleQuery.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RPC Query Result</CardTitle>
        </CardHeader>
        <CardContent>
          {debugInfo.currentUserFromRPC ? (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-600 font-semibold">✅ Gebruiker gevonden via RPC</p>
              <div className="mt-2 text-sm">
                <p><strong>Rollen:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                  {JSON.stringify(debugInfo.currentUserFromRPC.roles, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-orange-600">⚠️ Gebruiker niet gevonden via RPC</p>
          )}
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
