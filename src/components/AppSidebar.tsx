
import { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  FolderOpen, 
  Plus, 
  Settings, 
  Users,
  TrendingUp,
  Search,
  ChevronDown,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateArticle?: () => void;
}

export function AppSidebar({ activeSection, onSectionChange, onCreateArticle }: AppSidebarProps) {
  const { isManager } = useAuth();
  const { state } = useSidebar();
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const userMenuItems = [
    { id: 'articles', icon: FileText, label: 'Artikelen' },
    { id: 'categories', icon: FolderOpen, label: 'Categorieën' },
    { id: 'settings', icon: Settings, label: 'Instellingen' },
  ];

  const managerMenuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'articles', icon: FileText, label: 'Artikelen' },
    { id: 'categories', icon: FolderOpen, label: 'Categorieën' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'users', icon: Users, label: 'Gebruikers' },
    { id: 'settings', icon: Settings, label: 'Instellingen' },
  ];

  const menuItems = isManager ? managerMenuItems : userMenuItems;

  const handleCreateArticle = () => {
    console.log("Create article clicked"); // Debug log
    if (onCreateArticle) {
      onCreateArticle();
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <SidebarHeader className="border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 bg-clearbase-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          {state === "expanded" && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">ClearBase</h1>
              {isManager && (
                <Badge variant="secondary" className="text-xs">
                  Manager
                </Badge>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-gray-800">
        {isManager && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-2 py-2">
                <Button 
                  className="w-full bg-clearbase-600 hover:bg-clearbase-700 text-white" 
                  size="sm"
                  onClick={handleCreateArticle}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {state === "expanded" ? "Nieuw artikel" : ""}
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder={state === "expanded" ? "Zoek artikelen..." : ""} 
                  className="pl-10 text-sm bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 ${
                      activeSection === item.id 
                        ? 'bg-clearbase-100 dark:bg-clearbase-900 text-clearbase-700 dark:text-clearbase-300 border-r-2 border-clearbase-600' 
                        : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isManager && state === "expanded" && (
          <SidebarGroup>
            <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full group/collapsible bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="font-medium">Snelle statistieken</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mx-2 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Totaal artikelen</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gepubliceerd</span>
                        <span className="font-medium text-green-600 dark:text-green-400">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concepten</span>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Views deze maand</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">2,341</span>
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
