import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { BlockActions } from './BlockActions';
import { Block } from './BlockEditor';

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistBlockProps {
  block: Block;
  onChange: (content: ChecklistItem[]) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  placeholder = "Voeg een taak toe..."
}) => {
  const items: ChecklistItem[] = Array.isArray(block.content) ? block.content : [{ text: '', checked: false }];

  const updateItem = (index: number, updates: Partial<ChecklistItem>) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    );
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { text: '', checked: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (index === items.length - 1) {
        addItem();
      }
    } else if (e.key === 'Backspace' && !items[index].text && items.length > 1) {
      e.preventDefault();
      removeItem(index);
      // Focus previous item if it exists
      setTimeout(() => {
        const prevInput = document.querySelector(`[data-checklist-index="${index - 1}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }, 0);
    }
    
    onKeyDown(e);
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

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 group/item">
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => updateItem(index, { checked: !!checked })}
              className="mt-0.5"
            />
            
            <Input
              data-checklist-index={index}
              value={item.text}
              onChange={(e) => updateItem(index, { text: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={index === 0 ? placeholder : "Nog een taak..."}
              className="flex-1 border-none focus:ring-0 focus-visible:ring-0 bg-transparent"
              style={{
                textDecoration: item.checked ? 'line-through' : 'none',
                opacity: item.checked ? 0.6 : 1
              }}
            />

            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2 mt-2 h-8 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-3 h-3" />
          <span className="text-sm">Taak toevoegen</span>
        </Button>
      </div>
    </div>
  );
};