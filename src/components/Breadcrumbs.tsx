
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Button variant="ghost" size="sm" className="p-1 h-auto">
        <Home className="w-4 h-4" />
      </Button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${
              item.isActive 
                ? 'text-clearbase-600 dark:text-clearbase-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            onClick={item.onClick}
            disabled={item.isActive}
          >
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
};
