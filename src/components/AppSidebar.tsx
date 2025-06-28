
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Users,
  BarChart3,
  BookOpen,
  Plus,
  FolderOpen
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
    section: "dashboard",
  },
  {
    title: "Artikelen",
    url: "#",
    icon: BookOpen,
    section: "articles",
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    section: "analytics",
    managerOnly: true,
  },
  {
    title: "Categorieën",
    url: "#",
    icon: FolderOpen,
    section: "categories",
    managerOnly: true,
  },
  {
    title: "Gebruikers",
    url: "#",
    icon: Users,
    section: "users",
    managerOnly: true,
  },
  {
    title: "Instellingen",
    url: "#",
    icon: Settings,
    section: "settings",
  },
]

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateArticle: () => void;
}

export default function AppSidebar({ 
  activeSection, 
  onSectionChange, 
  onCreateArticle 
}: AppSidebarProps) {
  const { isManager } = useAuth();

  const filteredItems = items.filter(item => 
    !item.managerOnly || isManager
  );

  const handleKnowledgeBaseClick = () => {
    onSectionChange("dashboard");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <button 
            onClick={handleKnowledgeBaseClick}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Knowledge Base
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigatie</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeSection === item.section}
                  >
                    <button onClick={() => onSectionChange(item.section)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isManager && (
          <SidebarGroup>
            <SidebarGroupLabel>Acties</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button onClick={onCreateArticle}>
                      <Plus />
                      <span>Nieuw artikel</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-sm text-gray-500">
          © 2024 Knowledge Base
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
