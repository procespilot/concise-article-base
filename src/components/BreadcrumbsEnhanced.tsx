
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsEnhancedProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onHomeClick?: () => void;
}

const BreadcrumbsEnhanced = ({ items, showHome = true, onHomeClick }: BreadcrumbsEnhancedProps) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      {showHome && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onHomeClick}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1 h-auto"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
          {items.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          
          {item.onClick && !item.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className="text-gray-600 hover:text-gray-900 p-1 h-auto"
            >
              {item.label}
            </Button>
          ) : (
            <span className={item.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbsEnhanced;
