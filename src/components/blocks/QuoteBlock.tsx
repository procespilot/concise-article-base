import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Quote } from 'lucide-react';
import { BlockActions } from './BlockActions';
import { Block } from '@/types/block';

interface QuoteBlockProps {
  block: Block;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  placeholder = "Voeg een citaat toe..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown(e);
    
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
    <div className="group relative py-2">
      <div className="flex justify-end mb-2">
        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="border-l-4 border-primary pl-6 py-2 bg-muted/30 rounded-r-lg">
        <div className="flex gap-3">
          <Quote className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[2.5rem] resize-none border-none focus:ring-0 focus-visible:ring-0 p-0 text-lg italic leading-relaxed bg-transparent font-medium"
            style={{ 
              lineHeight: '1.8',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>
    </div>
  );
};