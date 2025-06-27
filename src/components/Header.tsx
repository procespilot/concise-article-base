
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
    <header className="flex items-center justify-between w-full bg-card/50 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Globaal zoeken... (Ctrl+K)"
            className="pl-10 bg-background/50 border-border/50 input-focus h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <KeyboardShortcutsHelp />
        <ThemeToggle />
        
        <Button variant="outline" size="icon" className="relative hover:shadow-glow">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive animate-pulse">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:shadow-glow">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2">
                  {isManager && (
                    <Badge variant="secondary" className="text-xs">
                      Manager
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profiel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="hover:bg-destructive/10 text-destructive cursor-pointer"
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
