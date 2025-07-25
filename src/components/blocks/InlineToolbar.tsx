import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Highlighter,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineToolbarProps {
  onFormat: (format: string, value?: string) => void;
  onAIAssist: () => void;
  selectedText: string;
  position: { x: number; y: number } | null;
  visible: boolean;
}

export const InlineToolbar: React.FC<InlineToolbarProps> = ({
  onFormat,
  onAIAssist,
  selectedText,
  position,
  visible
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const formatButtons = [
    {
      icon: Bold,
      label: 'Vet',
      action: 'bold',
      shortcut: '⌘B'
    },
    {
      icon: Italic,
      label: 'Cursief',
      action: 'italic',
      shortcut: '⌘I'
    },
    {
      icon: Underline,
      label: 'Onderstreept',
      action: 'underline',
      shortcut: '⌘U'
    },
    {
      icon: Link,
      label: 'Link',
      action: 'link',
      shortcut: '⌘K'
    },
    {
      icon: Highlighter,
      label: 'Markeren',
      action: 'highlight',
      shortcut: '⌘H'
    }
  ];

  const handleFormat = (action: string) => {
    if (action === 'link') {
      setShowLinkInput(true);
    } else {
      onFormat(action);
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      onFormat('link', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLinkSubmit();
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  if (!visible || !position) return null;

  return (
    <Card
      ref={toolbarRef}
      className="absolute z-50 p-1 shadow-lg border animate-fade-in"
      style={{
        left: position.x,
        top: position.y - 60,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex items-center gap-1">
        {!showLinkInput ? (
          <>
            {formatButtons.map((button) => {
              const Icon = button.icon;
              return (
                <Button
                  key={button.action}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleFormat(button.action)}
                  title={`${button.label} (${button.shortcut})`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onAIAssist}
              title="AI Assistent"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="text-xs">AI</span>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-2">
            <input
              ref={linkInputRef}
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-2 py-1 text-sm border rounded w-48 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              size="sm"
              onClick={handleLinkSubmit}
              disabled={!linkUrl.trim()}
            >
              OK
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};