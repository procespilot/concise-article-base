
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BarChart3, BookOpen, Plus, Settings, Tag, Users, Home } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateArticle: () => void;
}

const AppSidebar = ({ activeSection, onSectionChange, onCreateArticle }: AppSidebarProps) => {
  const { isManager } = useAuth();

  console.log('AppSidebar - isManager:', isManager); // Debug log

  const handleSectionClick = (section: string) => {
    console.log('Section clicked:', section); // Debug log
    onSectionChange(section);
  };

  const menuItems = [
    ...(isManager ? [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ] : []),
    { id: 'articles', label: 'Artikelen', icon: BookOpen },
    ...(isManager ? [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'categories', label: 'Categorieën', icon: Tag },
      { id: 'users', label: 'Gebruikers', icon: Users },
      { id: 'settings', label: 'Instellingen', icon: Settings }
    ] : [])
  ];

  console.log('Menu items:', menuItems); // Debug log

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-black">Knowledge Base</h2>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {isManager && (
            <SidebarMenuItem className="mb-4">
              <SidebarMenuButton
                onClick={onCreateArticle}
                className="w-full bg-blue-500 text-white hover:bg-blue-600 justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nieuw artikel
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleSectionClick(item.id)}
                  isActive={activeSection === item.id}
                  className={`w-full justify-start ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
