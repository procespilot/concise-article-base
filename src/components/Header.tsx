
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, isManager } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd"
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Fout bij uitloggen",
        description: "Er ging iets mis",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="flex items-center justify-between w-full bg-white border-b border-spacegray-300 px-8 py-6">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spacegray-400 w-4 h-4" />
          <Input
            placeholder="Globaal zoeken... (Ctrl+K)"
            className="pl-12 input-minimal h-12 text-base"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <KeyboardShortcutsHelp />
        <ThemeToggle />
        
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-spacegray-600 text-white border-0">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full">
              <Avatar className="h-12 w-12 border border-spacegray-300">
                <AvatarFallback className="bg-spacegray-500 text-white font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-spacegray-300">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium leading-none text-black">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2">
                  {isManager && (
                    <Badge className="text-xs bg-spacegray-100 text-spacegray-700 border-spacegray-300">
                      Manager
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-spacegray-300" />
            <DropdownMenuItem className="hover:bg-spacegray-50 cursor-pointer text-spacegray-700 focus:bg-spacegray-50 focus:text-black">
              <User className="mr-2 h-4 w-4" />
              Profiel
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-spacegray-300" />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="hover:bg-spacegray-50 text-spacegray-700 cursor-pointer focus:bg-spacegray-50 focus:text-black"
            >
              Uitloggen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
