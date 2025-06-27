
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
import { useUser } from "@/contexts/UserContext";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { isManager } = useUser();
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

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 bg-clearbase-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          {state === "expanded" && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">ClearBase</h1>
              {isManager && (
                <Badge variant="secondary" className="text-xs">
                  Manager
                </Badge>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isManager && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-2 py-2">
                <Button className="w-full bg-clearbase-600 hover:bg-clearbase-700 text-white" size="sm">
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
                  className="pl-10 text-sm bg-gray-50 focus:bg-white"
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
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
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
                <CollapsibleTrigger className="flex items-center justify-between w-full group/collapsible">
                  <span>Snelle statistieken</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <div className="bg-gray-50 rounded-lg p-4 mx-2 border border-gray-200">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Totaal artikelen</span>
                        <span className="font-medium">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gepubliceerd</span>
                        <span className="font-medium text-green-600">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concepten</span>
                        <span className="font-medium text-yellow-600">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Views deze maand</span>
                        <span className="font-medium">2,341</span>
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
