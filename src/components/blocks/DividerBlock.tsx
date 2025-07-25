import React from 'react';
import { Separator } from '@/components/ui/separator';
import { BlockActions } from './BlockActions';
import { Block } from '@/types/block';

interface DividerBlockProps {
  block: Block;
  onChange: (content: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown
}) => {
  return (
    <div className="group relative py-4">
      <div className="flex justify-center mb-2">
        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <Separator className="w-full" />
    </div>
  );
};