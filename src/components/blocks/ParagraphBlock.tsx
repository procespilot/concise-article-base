import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { BlockActions } from './BlockActions';
import { Block } from '@/types/block';

interface ParagraphBlockProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  placeholder?: string;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  onFocus,
  placeholder = "Begin met typen..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ content: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown(e);
    
    // Auto-resize on Enter
    if (e.key === 'Enter') {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  };

  return (
    <div className="group relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={block.content || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          className="min-h-[2.5rem] resize-none border-none focus:ring-0 focus-visible:ring-0 p-3 text-base leading-relaxed bg-transparent"
          style={{ 
            lineHeight: '1.8',
            overflow: 'hidden'
          }}
        />
        
        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};