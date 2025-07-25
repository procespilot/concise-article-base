import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  User, 
  Calendar, 
  Eye, 
  Star, 
  Globe,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { ArticleFormData } from '@/schemas/articleSchema';
import { cn } from '@/lib/utils';

interface ArticleMetadataSidebarProps {
  form: UseFormReturn<ArticleFormData>;
  categories: any[];
  article?: any;
  isEditing?: boolean;
  className?: string;
}

export const ArticleMetadataSidebar: React.FC<ArticleMetadataSidebarProps> = ({
  form,
  categories,
  article,
  isEditing = false,
  className
}) => {
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

  const watchedValues = form.watch();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status & Visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Status & Zichtbaarheid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Concept">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Concept
                      </div>
                    </SelectItem>
                    <SelectItem value="Gepubliceerd">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Gepubliceerd
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Uitgelicht artikel
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Prominente weergave
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
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer categorie" />
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
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Trefwoorden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {(field.value || []).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveKeyword(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    <Input
                      placeholder="Voeg trefwoord toe"
                      className="h-8 text-sm"
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
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input) {
                          handleAddKeyword(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <FormDescription className="text-xs">
                    {(field.value || []).length}/10 trefwoorden
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Article Info */}
      {isEditing && article && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Artikel Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Auteur: {article.profiles?.first_name} {article.profiles?.last_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Aangemaakt: {new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Bewerkt: {new Date(article.updated_at).toLocaleDateString('nl-NL')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span>Weergaven: {article.views || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Statistieken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Woorden:</span>
            <span>{watchedValues.content?.split(/\s+/).filter(Boolean).length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Karakters:</span>
            <span>{watchedValues.content?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trefwoorden:</span>
            <span>{watchedValues.keywords?.length || 0}/10</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};