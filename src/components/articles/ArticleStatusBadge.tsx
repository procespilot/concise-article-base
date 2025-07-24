import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Archive, AlertCircle } from 'lucide-react';

interface ArticleStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ArticleStatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = false 
}: ArticleStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Gepubliceerd':
        return {
          variant: 'default' as const,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
          icon: CheckCircle,
          label: 'Gepubliceerd'
        };
      case 'Concept':
        return {
          variant: 'secondary' as const,
          className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
          icon: Clock,
          label: 'Concept'
        };
      case 'Archief':
        return {
          variant: 'outline' as const,
          className: 'border-muted-foreground/20 text-muted-foreground hover:bg-muted',
          icon: Archive,
          label: 'Archief'
        };
      case 'Review':
        return {
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          icon: AlertCircle,
          label: 'In Review'
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          icon: AlertCircle,
          label: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-1';

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClass} inline-flex items-center gap-1`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {config.label}
    </Badge>
  );
};

export default ArticleStatusBadge;