
import { 
  BarChart3, 
  BookOpen, 
  FolderOpen, 
  Plus, 
  Settings, 
  Users,
  FileText,
  TrendingUp,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const { isManager } = useUser();

  // Different menu items for users vs managers
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
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {isManager && (
        <div className="p-6">
          <Button className="w-full bg-clearbase-600 hover:bg-clearbase-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nieuw artikel
          </Button>
        </div>
      )}
      
      {/* Search for all users */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            placeholder="Zoek artikelen..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clearbase-500 focus:border-transparent bg-gray-50"
          />
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                activeSection === item.id
                  ? "bg-clearbase-100 text-clearbase-700 border-r-2 border-clearbase-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      
      {isManager && (
        <div className="px-4 mt-8">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Snelle statistieken</h3>
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
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
