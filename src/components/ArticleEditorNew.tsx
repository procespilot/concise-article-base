
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Eye, Globe, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { articleSchema, ArticleFormData } from '@/schemas/articleSchema';
import { useArticleOperations } from '@/hooks/useArticleOperations';
import { useAutosave } from '@/hooks/useAutosave';
import { ArticleFormFields } from './ArticleFormFields';
import { ArticlePreview } from './ArticlePreview';
import { ArticleMetadataSidebar } from './ArticleMetadataSidebar';
import { AIAssistant } from './blocks/AIAssistant';
import { InlineToolbar } from './blocks/InlineToolbar';

interface ArticleEditorNewProps {
  articleId?: string;
  onBack: () => void;
  articles: any[];
  categories: any[];
}

export const ArticleEditorNew: React.FC<ArticleEditorNewProps> = ({ 
  articleId, 
  onBack, 
  articles, 
  categories 
}) => {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  
  const {
    createArticle,
    publishArticle,
    isCreating,
    isPublishing,
    createError,
    publishError
  } = useArticleOperations();

  const isEditing = Boolean(articleId);
  const article = articleId ? articles.find(a => a.id === articleId) : null;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      keywords: [],
      featured: false,
      status: 'Concept'
    }
  });

  const watchedValues = form.watch();

  // Load existing article data
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category_id: article.category_id || '',
        keywords: article.keywords || [],
        featured: article.featured || false,
        status: article.status || 'Concept'
      });
      setHasUnsavedChanges(false);
    }
  }, [article, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && article) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, article]);

  // Autosave functionality
  const handleAutosave = useCallback((data: ArticleFormData) => {
    if (form.formState.isValid) {
      createArticle(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [createArticle, form.formState.isValid]);

  useAutosave({
    data: watchedValues,
    onSave: handleAutosave,
    enabled: !isEditing && form.formState.isValid
  });

  const handleSave = useCallback(() => {
    form.handleSubmit((data) => {
      createArticle(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    })();
  }, [form, createArticle]);

  const handlePublish = useCallback(() => {
    if (!articleId) {
      toast({
        title: "Kan niet publiceren",
        description: "Sla het artikel eerst op als concept",
        variant: "destructive"
      });
      return;
    }

    publishArticle(articleId);
  }, [articleId, publishArticle, toast]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm("Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt teruggaan?")) {
        onBack();
      }
    } else {
      onBack();
    }
  }, [hasUnsavedChanges, onBack]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY
      });
    } else {
      setSelectedText('');
      setToolbarPosition(null);
    }
  };

  const handleFormat = (format: string, value?: string) => {
    // This would integrate with the block editor's formatting
    console.log('Format:', format, value);
    setToolbarPosition(null);
  };

  const handleAIAssistant = () => {
    setShowAIAssistant(true);
    setToolbarPosition(null);
  };

  const handleAIInsert = (text: string) => {
    // This would insert the AI-generated text into the current block
    console.log('AI Insert:', text);
    setShowAIAssistant(false);
  };

  const canSave = form.formState.isValid && 
    watchedValues.title?.trim() && 
    watchedValues.content?.trim() && 
    watchedValues.category_id?.trim();

  const canPublish = article && article.status === 'Concept' && canSave;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack} disabled={isCreating || isPublishing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Alert className="inline-flex items-center gap-2 p-2 w-auto border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                Niet opgeslagen wijzigingen
              </AlertDescription>
            </Alert>
          )}

          {lastSaved && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Clock className="w-4 h-4" />
              <span>Opgeslagen {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            disabled={isCreating || isPublishing}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? "Bewerken" : "Voorbeeld"}
          </Button>

          {canPublish && (
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isPublishing ? "Publiceren..." : "Publiceren"}
            </Button>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={!canSave || isCreating}
            className="bg-clearbase-600 hover:bg-clearbase-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isCreating ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </div>

      {(createError || publishError) && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {createError?.message || publishError?.message || "Er is een fout opgetreden"}
          </AlertDescription>
        </Alert>
      )}

      {categories.length === 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Er zijn nog geen categorieën beschikbaar. Voeg eerst een categorie toe om artikelen te kunnen opslaan.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {isEditing ? "Artikel bewerken" : "Nieuw artikel"}
                {article?.status && (
                  <Badge variant={article.status === 'Gepubliceerd' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPreview ? (
                <ArticlePreview data={watchedValues} />
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                    <div onMouseUp={handleTextSelection}>
                      <ArticleFormFields form={form} categories={categories} />
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <ArticleMetadataSidebar 
            form={form} 
            categories={categories}
            article={article}
            isEditing={isEditing}
            className="sticky top-6"
          />
        </div>
      </div>

      {/* Inline Toolbar */}
      <InlineToolbar
        onFormat={handleFormat}
        onAIAssist={handleAIAssistant}
        selectedText={selectedText}
        position={toolbarPosition}
        visible={!!selectedText && !!toolbarPosition}
      />

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          content={watchedValues.content || ''}
          onInsert={handleAIInsert}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
};

export default ArticleEditorNew;
