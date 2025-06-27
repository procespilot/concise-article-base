
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, isManager } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Fout bij uitloggen",
        description: "Probeer het opnieuw",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-end space-x-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>
          {user.email}
          {isManager && <span className="ml-1 text-blue-600 font-medium">(Manager)</span>}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Uitloggen
      </Button>
    </div>
  );
};

export default Header;
