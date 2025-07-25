import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockActions } from './BlockActions';
import { Block } from '@/types/block';
import { cn } from '@/lib/utils';

interface HeadingBlockProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  placeholder?: string;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  onFocus,
  placeholder = "Koptekst..."
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const level = block.meta?.level || 2;

  useEffect(() => {
    // Auto-focus when block is created
    if (inputRef.current && !block.content) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ content: e.target.value });
  };

  const handleLevelChange = (newLevel: string) => {
    onChange({ meta: { ...block.meta, level: parseInt(newLevel) } });
  };

  const getHeadingClasses = (level: number) => {
    switch (level) {
      case 1:
        return "text-3xl font-bold";
      case 2:
        return "text-2xl font-semibold";
      case 3:
        return "text-xl font-medium";
      default:
        return "text-2xl font-semibold";
    }
  };

  return (
    <div className="group relative py-2">
      <div className="flex items-center gap-2 mb-2">
        <Select value={level.toString()} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1</SelectItem>
            <SelectItem value="2">H2</SelectItem>
            <SelectItem value="3">H3</SelectItem>
          </SelectContent>
        </Select>

        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <Input
        ref={inputRef}
        value={block.content || ''}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        className={cn(
          "border-none focus:ring-0 focus-visible:ring-0 p-0 bg-transparent",
          getHeadingClasses(level)
        )}
      />
    </div>
  );
};