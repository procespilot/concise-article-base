import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BlockActions } from './BlockActions';
import { Block } from './BlockEditor';
import { cn } from '@/lib/utils';

interface CalloutBlockProps {
  block: Block;
  onChange: (content: string, meta?: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

const calloutVariants = {
  info: {
    label: 'Info',
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900',
    iconClassName: 'text-blue-600'
  },
  warning: {
    label: 'Waarschuwing',
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    iconClassName: 'text-yellow-600'
  },
  success: {
    label: 'Succes',
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-900',
    iconClassName: 'text-green-600'
  },
  error: {
    label: 'Fout',
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClassName: 'text-red-600'
  }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  placeholder = "Voeg een belangrijk bericht toe..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const variant = block.meta?.variant || 'info';
  const calloutConfig = calloutVariants[variant as keyof typeof calloutVariants];
  const Icon = calloutConfig.icon;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleVariantChange = (newVariant: string) => {
    onChange(block.content, { variant: newVariant });
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
      <div className="flex items-center gap-2 mb-2">
        <Select value={variant} onValueChange={handleVariantChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(calloutVariants).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="w-4 h-4" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className={cn(
        "rounded-lg border p-4",
        calloutConfig.className
      )}>
        <div className="flex gap-3">
          <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", calloutConfig.iconClassName)} />
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[2.5rem] resize-none border-none focus:ring-0 focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent"
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