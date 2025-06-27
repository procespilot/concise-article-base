
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserRoleDebug = () => {
  const { user, userRole, isManager, isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [currentUserRoles, setCurrentUserRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user's profile using new RLS policies
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setCurrentUserProfile(profile);

          // Get current user's roles directly
          const { data: roles } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
          setCurrentUserRoles(roles || []);
        }

        // Get all users with roles using RPC function
        const { data: users, error } = await supabase.rpc('get_users_with_roles');
        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setAllUsers(users || []);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Huidige Gebruiker Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Auth User ID:</strong> {user?.id || 'Niet ingelogd'}</p>
            <p><strong>Auth User Email:</strong> {user?.email || 'Geen email'}</p>
            <p><strong>Detected Role:</strong> {userRole}</p>
            <p><strong>Is Manager:</strong> {isManager ? 'Ja' : 'Nee'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Ja' : 'Nee'}</p>
            <p><strong>Profile Data:</strong> {JSON.stringify(currentUserProfile, null, 2)}</p>
            <p><strong>Direct Role Query:</strong> {JSON.stringify(currentUserRoles, null, 2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Gebruikers in Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allUsers.map((user, index) => (
              <div key={index} className="border p-2 rounded text-sm">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Naam:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Actief:</strong> {user.is_active ? 'Ja' : 'Nee'}</p>
                <p><strong>Rollen:</strong> {JSON.stringify(user.roles || user.user_roles, null, 2)}</p>
              </div>
            ))}
            {allUsers.length === 0 && (
              <p className="text-gray-500">Geen gebruikers gevonden of geen toegang</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleDebug;
