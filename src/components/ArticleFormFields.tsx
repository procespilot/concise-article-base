
import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { AdvancedBlockEditor } from '@/components/blocks/AdvancedBlockEditor';
import { Block } from '@/types/block';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleFormData } from '@/schemas/articleSchema';

interface ArticleFormFieldsProps {
  form: UseFormReturn<ArticleFormData>;
  categories: any[];
}

export const ArticleFormFields: React.FC<ArticleFormFieldsProps> = ({ form, categories }) => {
  const handleAddKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    if (keyword.trim() && !currentKeywords.includes(keyword.trim()) && currentKeywords.length < 10) {
      form.setValue('keywords', [...currentKeywords, keyword.trim()]);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const currentKeywords = form.getValues('keywords') || [];
    const newKeywords = currentKeywords.filter((_, i) => i !== index);
    form.setValue('keywords', newKeywords);
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titel *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Voer een titel in voor je artikel" 
                {...field}
                maxLength={200}
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0}/200 karakters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uittreksel</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Korte samenvatting van je artikel"
                {...field}
                maxLength={500}
                rows={3}
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0}/500 karakters - Optioneel, gebruikt voor previews
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => {
          // Convert content string to blocks
          const blocks = useMemo(() => {
            if (!field.value) {
              return [];
            }
            
            // Check if content is already in blocks format (JSON)
            if (typeof field.value === 'string') {
              try {
                const parsed = JSON.parse(field.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed;
                }
              } catch {
                // Not JSON, treat as markdown/text
                if (field.value.trim()) {
                  return [{
                    id: `block_${Date.now()}`,
                    type: 'paragraph' as const,
                    content: field.value
                  }];
                }
              }
            }
            
            return [];
          }, [field.value]);

          const handleBlocksChange = (newBlocks: Block[]) => {
            // Store blocks as JSON for advanced functionality
            const blocksJSON = JSON.stringify(newBlocks);
            field.onChange(blocksJSON);
          };

          return (
            <FormItem>
              <FormLabel>Inhoud *</FormLabel>
              <FormControl>
                <div className="border rounded-md p-4 min-h-[200px]">
                  <AdvancedBlockEditor
                    blocks={blocks}
                    onChange={handleBlocksChange}
                    placeholder="Begin met typen of druk '/' voor blokopties..."
                    showToolbar={true}
                    autoSave={false}
                  />
                </div>
              </FormControl>
              <FormDescription>
                {blocks.length} {blocks.length === 1 ? 'blok' : 'blokken'} - Gebruik '/' voor blokopties, Ctrl+Z voor ongedaan maken
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorie *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een categorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trefwoorden</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(field.value || []).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveKeyword(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Voeg een trefwoord toe"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        handleAddKeyword(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input) {
                        handleAddKeyword(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              {(field.value || []).length}/10 trefwoorden - Druk Enter of klik + om toe te voegen
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="featured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Uitgelicht artikel</FormLabel>
              <FormDescription>
                Uitgelichte artikelen worden prominenter weergegeven
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
