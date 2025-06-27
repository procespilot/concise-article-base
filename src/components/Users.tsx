
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, User, Plus, Mail, Phone } from "lucide-react";
import UserForm from './UserForm';

interface UsersProps {
  users: any[];
  onRefresh: () => Promise<void>;
}

const Users = ({ users, onRefresh }: UsersProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleUserAdded = async () => {
    await onRefresh();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gebruikers</h1>
          <p className="text-gray-600">Beheer gebruikers en hun rollen</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFormOpen(true)} className="bg-clearbase-600 hover:bg-clearbase-700">
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
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-clearbase-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-clearbase-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'Geen naam'
                      }
                    </h3>
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
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {user.user_roles?.map((roleObj: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={getRoleBadgeVariant(roleObj.role)}
                      >
                        {getRoleDisplayName(roleObj.role)}
                      </Badge>
                    ))}
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
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen gebruikers gevonden</h3>
          <p className="text-gray-600 mb-4">Begin met het toevoegen van je eerste gebruiker.</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-clearbase-600 hover:bg-clearbase-700">
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
