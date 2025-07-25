import React from 'react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3,
  AlertTriangle, 
  Quote, 
  Code, 
  CheckSquare, 
  Minus,
  FileText,
  Image
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Block } from './BlockEditor';

interface BlockTypeSelectorProps {
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}

const blockTypes = [
  {
    type: 'paragraph' as const,
    label: 'Paragraaf',
    description: 'Gewone tekst',
    icon: FileText,
    shortcut: 'P'
  },
  {
    type: 'heading' as const,
    label: 'Kop',
    description: 'Sectie koptekst',
    icon: Heading2,
    shortcut: 'H'
  },
  {
    type: 'callout' as const,
    label: 'Callout',
    description: 'Tip, waarschuwing of info',
    icon: AlertTriangle,
    shortcut: 'C'
  },
  {
    type: 'quote' as const,
    label: 'Quote',
    description: 'Citaat of blockquote',
    icon: Quote,
    shortcut: 'Q'
  },
  {
    type: 'code' as const,
    label: 'Code',
    description: 'Code blok met syntax highlighting',
    icon: Code,
    shortcut: 'K'
  },
  {
    type: 'checklist' as const,
    label: 'Checklist',
    description: 'To-do lijst met afvinkboxen',
    icon: CheckSquare,
    shortcut: 'T'
  },
  {
    type: 'image' as const,
    label: 'Afbeelding',
    description: 'Upload of embed een afbeelding',
    icon: Image,
    shortcut: 'I'
  },
  {
    type: 'divider' as const,
    label: 'Divider',
    description: 'Scheidingslijn tussen secties',
    icon: Minus,
    shortcut: 'D'
  }
];

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({ onSelect, onClose }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Handle shortcut keys
    const shortcutBlock = blockTypes.find(block => 
      block.shortcut.toLowerCase() === e.key.toLowerCase()
    );
    if (shortcutBlock) {
      onSelect(shortcutBlock.type);
    }
  };

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/20" 
      onClick={onClose}
    >
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="mb-3">
              <h3 className="font-medium text-sm text-muted-foreground">Blok type selecteren</h3>
              <p className="text-xs text-muted-foreground mt-1">Kies een blok type of gebruik sneltoetsen</p>
            </div>
            
            <div className="space-y-1" onKeyDown={handleKeyDown} tabIndex={0}>
              {blockTypes.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <Button
                    key={blockType.type}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => onSelect(blockType.type)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{blockType.label}</span>
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            {blockType.shortcut}
                          </kbd>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {blockType.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};