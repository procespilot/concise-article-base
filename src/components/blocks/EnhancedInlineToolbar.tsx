import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link, Highlighter, Type, Palette, AlignLeft, AlignCenter, AlignRight, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface EnhancedInlineToolbarProps {
  selectedText: string;
  position: { x: number; y: number } | null;
  visible: boolean;
  onFormat: (format: string, value?: string) => void;
  onAIAssist?: () => void;
  className?: string;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  code: boolean;
  link: boolean;
  highlight: boolean;
}

export const EnhancedInlineToolbar: React.FC<EnhancedInlineToolbarProps> = ({
  selectedText,
  position,
  visible,
  onFormat,
  onAIAssist,
  className
}) => {
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    code: false,
    link: false,
    highlight: false
  });
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Detect current formatting of selected text
  useEffect(() => {
    if (selectedText && visible) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const parentElement = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement 
          : container as Element;

        if (parentElement) {
          const computedStyle = window.getComputedStyle(parentElement);
          setFormatState({
            bold: computedStyle.fontWeight === 'bold' || computedStyle.fontWeight === '700',
            italic: computedStyle.fontStyle === 'italic',
            underline: computedStyle.textDecoration.includes('underline'),
            code: parentElement.tagName.toLowerCase() === 'code',
            link: parentElement.tagName.toLowerCase() === 'a',
            highlight: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent'
          });
        }
      }
    }
  }, [selectedText, visible]);

  const handleFormat = (format: string, value?: string) => {
    onFormat(format, value);
    setFormatState(prev => ({
      ...prev,
      [format]: !prev[format as keyof FormatState]
    }));
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      handleFormat('link', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const colors = [
    { name: 'Geel', value: '#fef08a', class: 'bg-yellow-200' },
    { name: 'Groen', value: '#bbf7d0', class: 'bg-green-200' },
    { name: 'Blauw', value: '#bfdbfe', class: 'bg-blue-200' },
    { name: 'Paars', value: '#e9d5ff', class: 'bg-purple-200' },
    { name: 'Roze', value: '#fbcfe8', class: 'bg-pink-200' },
    { name: 'Oranje', value: '#fed7aa', class: 'bg-orange-200' }
  ];

  if (!visible || !position) return null;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-2 animate-in fade-in-50 zoom-in-95",
        "max-w-md",
        className
      )}
      style={{
        left: Math.max(8, Math.min(position.x - 100, window.innerWidth - 400)),
        top: position.y - 60,
      }}
    >
      {/* Text formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={formatState.bold ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat('bold')}
          className="h-8 w-8 p-0"
          title="Vet (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant={formatState.italic ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat('italic')}
          className="h-8 w-8 p-0"
          title="Cursief (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          variant={formatState.underline ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat('underline')}
          className="h-8 w-8 p-0"
          title="Onderstrepen (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </Button>
        
        <Button
          variant={formatState.code ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat('code')}
          className="h-8 w-8 p-0"
          title="Inline code"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Link and highlight */}
      <div className="flex items-center gap-1">
        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
          <PopoverTrigger asChild>
            <Button
              variant={formatState.link ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              title="Link toevoegen (Ctrl+K)"
            >
              <Link className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <form onSubmit={handleLinkSubmit} className="space-y-2">
              <div className="text-sm font-medium">Link toevoegen</div>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!linkUrl.trim()}>
                  Toevoegen
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLinkInput(false)}
                >
                  Annuleren
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              variant={formatState.highlight ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              title="Markeren"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-2">
              <div className="text-sm font-medium">Markeerkleur</div>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleFormat('highlight', color.value);
                      setShowColorPicker(false);
                    }}
                    className="h-8 p-1 justify-start"
                  >
                    <div className={cn("w-4 h-4 rounded mr-2", color.class)} />
                    <span className="text-xs">{color.name}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleFormat('highlight', 'transparent');
                  setShowColorPicker(false);
                }}
                className="w-full justify-start"
              >
                Markering verwijderen
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('align', 'left')}
          className="h-8 w-8 p-0"
          title="Links uitlijnen"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('align', 'center')}
          className="h-8 w-8 p-0"
          title="Centreren"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('align', 'right')}
          className="h-8 w-8 p-0"
          title="Rechts uitlijnen"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Assistant */}
      {onAIAssist && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onAIAssist}
            className="h-8 px-3 text-xs"
            title="AI Assistent"
          >
            <Type className="w-4 h-4 mr-1" />
            AI
          </Button>
        </>
      )}

      {/* Selected text info */}
      <div className="text-xs text-muted-foreground ml-2 px-2 py-1 bg-muted rounded">
        {selectedText.length} tekens
      </div>
    </div>
  );
};