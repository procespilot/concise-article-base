
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut, isManager } = useAuth();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-clearbase-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CB</span>
        </div>
        <span className="font-semibold text-gray-900">ClearBase</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{user?.email}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {isManager ? 'Manager' : 'Gebruiker'}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Uitloggen
        </Button>
      </div>
    </div>
  );
};

export default Header;
