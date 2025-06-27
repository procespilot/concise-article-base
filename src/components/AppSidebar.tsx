
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
  ChevronDown
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
    console.log("Create article clicked");
    if (onCreateArticle) {
      onCreateArticle();
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-white border-gray-200">
      <SidebarHeader className="border-b bg-white border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
            <span className="text-black font-medium text-sm">CB</span>
          </div>
          {state === "expanded" && (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-light text-black">ClearBase</h1>
              {isManager && (
                <Badge className="text-xs bg-gray-100 text-black border-gray-200">
                  Manager
                </Badge>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white p-6">
        {isManager && (
          <SidebarGroup className="mb-8">
            <SidebarGroupContent>
              <Button 
                className="w-full mb-6" 
                onClick={handleCreateArticle}
              >
                <Plus className="w-4 h-4 mr-2" />
                {state === "expanded" ? "Nieuw artikel" : ""}
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mb-8">
          <SidebarGroupContent>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder={state === "expanded" ? "Zoek artikelen..." : ""} 
                className="pl-12 bg-white border-gray-200 text-black text-sm"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mb-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full bg-white text-black hover:bg-gray-100 py-3 ${
                      activeSection === item.id 
                        ? 'bg-gray-100 text-black border-r-2 border-blue-500' 
                        : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-normal">{item.label}</span>
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
                <CollapsibleTrigger className="flex items-center justify-between w-full group/collapsible bg-white text-black hover:bg-gray-100 py-2">
                  <span className="font-normal text-sm uppercase tracking-wide">Snelle statistieken</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <div className="bg-white border border-gray-200 p-6 mt-4">
                    <div className="space-y-4 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Totaal artikelen</span>
                        <span className="font-medium text-black">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gepubliceerd</span>
                        <span className="font-medium text-black">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concepten</span>
                        <span className="font-medium text-gray-600">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Views deze maand</span>
                        <span className="font-medium text-black">2,341</span>
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
