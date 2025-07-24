import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockActionsProps {
  onDelete: () => void;
  onDuplicate: () => void;
  className?: string;
}

export const BlockActions: React.FC<BlockActionsProps> = ({
  onDelete,
  onDuplicate,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDuplicate}
        className="h-6 w-6 p-0 hover:bg-muted"
        title="Dupliceer blok"
      >
        <Copy className="w-3 h-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
        title="Verwijder blok"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};