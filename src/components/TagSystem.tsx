
import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TagSystemProps {
  tags: string[];
  availableTags?: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  readOnly?: boolean;
}

const TagSystem = ({ 
  tags, 
  availableTags = [], 
  onTagsChange, 
  maxTags = 10,
  placeholder = "Voeg een tag toe...",
  readOnly = false
}: TagSystemProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = availableTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      onTagsChange([...tags, normalizedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-md bg-white">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {tag}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTag(tag)}
              className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {tags.length < maxTags && (
          <div className="relative flex-1 min-w-[120px]">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              className="border-0 p-0 h-6 text-sm focus-visible:ring-0"
            />
            
            {showSuggestions && filteredSuggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-40 overflow-y-auto">
                <CardContent className="p-0">
                  {filteredSuggestions.slice(0, 5).map(tag => (
                    <div
                      key={tag}
                      className="p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => addTag(tag)}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{tag}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags
      </div>
    </div>
  );
};

export default TagSystem;
