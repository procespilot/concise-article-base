
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, User, Plus, Mail, Phone, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserForm from './UserForm';

interface UsersProps {
  users: any[];
  onRefresh: () => Promise<void>;
}

const Users = ({ users, onRefresh }: UsersProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activatingUsers, setActivatingUsers] = useState<Set<string>>(new Set());
  const [deactivatingUsers, setDeactivatingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleUserAdded = async () => {
    await onRefresh();
  };

  const handleActivateUser = async (userId: string) => {
    setActivatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { data, error } = await supabase.rpc('activate_user', {
        p_user_id: userId
      });

      if (error) throw error;

      const result = data as { error?: string; success?: boolean; message?: string };
      
      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Gebruiker geactiveerd",
        description: "De gebruiker is succesvol geactiveerd"
      });

      await onRefresh();
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "Fout bij activeren",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setActivatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setDeactivatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { data, error } = await supabase.rpc('deactivate_user', {
        p_user_id: userId
      });

      if (error) throw error;

      const result = data as { error?: string; success?: boolean; message?: string };
      
      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Gebruiker gedeactiveerd",
        description: "De gebruiker is succesvol gedeactiveerd"
      });

      await onRefresh();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Fout bij deactiveren",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setDeactivatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      default:
        return 'Gebruiker';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <ShieldCheck className="w-4 h-4 text-green-600" />
    ) : (
      <ShieldX className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Gebruikers</h1>
          <p className="text-gray-600">Beheer gebruikers en hun rollen</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-500 text-black hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Gebruiker toevoegen
          </Button>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Vernieuwen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <Card key={user.id} className={`border border-gray-200 bg-white ${!user.is_active ? 'opacity-60 border-red-200' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-black">
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : 'Geen naam'
                        }
                      </h3>
                      {getStatusIcon(user.is_active)}
                    </div>
                    <div className="space-y-1 mt-2">
                      {user.email && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.phone}
                        </div>
                      )}
                      {user.activated_at && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Shield className="w-4 h-4 mr-2" />
                          Geactiveerd: {new Date(user.activated_at).toLocaleDateString('nl-NL')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-1">
                      {user.user_roles?.map((roleObj: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant={getRoleBadgeVariant(roleObj.role)}
                          className="bg-blue-500 text-black border-blue-500"
                        >
                          {getRoleDisplayName(roleObj.role)}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={user.is_active ? "default" : "destructive"} className="bg-blue-500 text-black border-blue-500">
                      {user.is_active ? "Actief" : "Inactief"}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {!user.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivateUser(user.id)}
                        disabled={activatingUsers.has(user.id)}
                      >
                        {activatingUsers.has(user.id) ? 'Activeren...' : 'Activeren'}
                      </Button>
                    )}
                    {user.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeactivateUser(user.id)}
                        disabled={deactivatingUsers.has(user.id)}
                      >
                        {deactivatingUsers.has(user.id) ? 'Deactiveren...' : 'Deactiveren'}
                      </Button>
                    )}
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    Toegevoegd: {new Date(user.created_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 bg-white">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">Geen gebruikers gevonden</h3>
          <p className="text-gray-600 mb-4">Begin met het toevoegen van je eerste gebruiker.</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-500 text-black hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Eerste gebruiker toevoegen
          </Button>
        </div>
      )}

      <UserForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};

export default Users;
