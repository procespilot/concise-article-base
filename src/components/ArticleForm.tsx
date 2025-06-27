
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";
import { sanitizeInput, sanitizeHtml } from "@/utils/sanitization";
import { validateArticleData, ValidationResult } from "@/utils/validation";
import { debounce } from "@/utils/performance";

interface Article {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category_id: string;
  status: string;
  featured: boolean;
  keywords: string[];
}

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  formData?: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string;
    keywords: string[];
    status: "Concept" | "Gepubliceerd";
    featured: boolean;
  };
  onFormDataChange?: (data: any) => void;
  categories: Category[];
  onSubmit?: (articleData: any) => Promise<boolean>;
  initialData?: Article;
  isEditing?: boolean;
}

const ArticleForm = React.memo(({ 
  formData, 
  onFormDataChange, 
  categories, 
  onSubmit, 
  initialData, 
  isEditing = false 
}: ArticleFormProps) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('Concept');
  const [featured, setFeatured] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isControlled = formData && onFormDataChange;

  // Memoized validation function
  const validateForm = useCallback((): ValidationResult => {
    return validateArticleData({
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId.trim(),
      excerpt: excerpt.trim(),
      keywords
    });
  }, [title, content, categoryId, excerpt, keywords]);

  // Debounced validation to avoid excessive validation calls
  const debouncedValidation = useMemo(
    () => debounce(() => {
      const validation = validateForm();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
      } else {
        setValidationErrors([]);
      }
    }, 300),
    [validateForm]
  );

  useEffect(() => {
    if (isControlled) {
      // Controlled by parent component (ArticleEditor)
      setTitle(formData.title);
      setExcerpt(formData.excerpt);
      setContent(formData.content);
      setCategoryId(formData.category_id);
      setStatus(formData.status);
      setFeatured(formData.featured);
      setKeywords(formData.keywords);
    } else if (initialData) {
      // Populate from initialData (for dialog mode)
      console.log('Populating form with initial data:', initialData);
      setTitle(initialData.title || '');
      setExcerpt(initialData.excerpt || '');
      setContent(initialData.content || '');
      setCategoryId(initialData.category_id || '');
      setStatus(initialData.status || 'Concept');
      setFeatured(initialData.featured || false);
      setKeywords(initialData.keywords || []);
    } else {
      // Reset form
      setTitle('');
      setExcerpt('');
      setContent('');
      setCategoryId('');
      setStatus('Concept');
      setFeatured(false);
      setKeywords([]);
    }
  }, [formData, initialData, isControlled]);

  const updateFormData = useCallback((updates: any) => {
    if (isControlled && onFormDataChange) {
      onFormDataChange({ ...formData, ...updates });
    }
  }, [isControlled, onFormDataChange, formData]);

  const handleTitleChange = useCallback((value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setTitle(sanitizedValue);
    updateFormData({ title: sanitizedValue });
    debouncedValidation();
  }, [updateFormData, debouncedValidation]);

  const handleExcerptChange = useCallback((value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setExcerpt(sanitizedValue);
    updateFormData({ excerpt: sanitizedValue });
  }, [updateFormData]);

  const handleContentChange = useCallback((value: string) => {
    const sanitizedValue = sanitizeHtml(value);
    setContent(sanitizedValue);
    updateFormData({ content: sanitizedValue });
    debouncedValidation();
  }, [updateFormData, debouncedValidation]);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryId(value);
    updateFormData({ category_id: value });
    debouncedValidation();
  }, [updateFormData, debouncedValidation]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    updateFormData({ status: value });
  }, [updateFormData]);

  const handleFeaturedChange = useCallback((checked: boolean) => {
    setFeatured(checked);
    updateFormData({ featured: checked });
  }, [updateFormData]);

  const handleKeywordsChange = useCallback((newKeywords: string[]) => {
    setKeywords(newKeywords);
    updateFormData({ keywords: newKeywords });
  }, [updateFormData]);

  const handleAddKeyword = useCallback(() => {
    const trimmedKeyword = sanitizeInput(keywordInput.trim());
    if (trimmedKeyword && !keywords.includes(trimmedKeyword) && keywords.length < 10) {
      const newKeywords = [...keywords, trimmedKeyword];
      handleKeywordsChange(newKeywords);
      setKeywordInput('');
    }
  }, [keywordInput, keywords, handleKeywordsChange]);

  const handleRemoveKeyword = useCallback((keywordToRemove: string) => {
    const newKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
    handleKeywordsChange(newKeywords);
  }, [keywords, handleKeywordsChange]);

  const handleKeywordInputKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  }, [handleAddKeyword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!onSubmit) {
      console.log('No onSubmit handler provided');
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const success = await onSubmit({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category_id: categoryId,
        status,
        featured,
        keywords
      });

      if (success && !isControlled) {
        // Reset form
        setTitle('');
        setExcerpt('');
        setContent('');
        setCategoryId('');
        setStatus('Concept');
        setFeatured(false);
        setKeywords([]);
        setKeywordInput('');
      }
    } catch (error) {
      console.error('Error submitting article:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, title, excerpt, content, categoryId, status, featured, keywords, isControlled]);

  // Memoized character count components
  const titleCharCount = useMemo(() => `${title.length}/200 karakters`, [title.length]);
  const excerptCharCount = useMemo(() => `${excerpt.length}/500 karakters`, [excerpt.length]);
  const contentCharCount = useMemo(() => `${content.length}/50,000 karakters`, [content.length]);
  const keywordCount = useMemo(() => `${keywords.length}/10 trefwoorden`, [keywords.length]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Artikel titel"
          required
          maxLength={200}
        />
        <p className="text-sm text-gray-500 mt-1">{titleCharCount}</p>
      </div>

      <div>
        <Label htmlFor="excerpt">Samenvatting</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => handleExcerptChange(e.target.value)}
          placeholder="Korte samenvatting van het artikel"
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">{excerptCharCount}</p>
      </div>

      <div>
        <Label htmlFor="content">Inhoud *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Artikel inhoud"
          rows={8}
          required
          maxLength={50000}
        />
        <p className="text-sm text-gray-500 mt-1">{contentCharCount}</p>
      </div>

      <div>
        <Label htmlFor="category">Categorie *</Label>
        <Select value={categoryId} onValueChange={handleCategoryChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer een categorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Concept">Concept</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Gepubliceerd">Gepubliceerd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={featured}
          onCheckedChange={handleFeaturedChange}
        />
        <Label htmlFor="featured">Uitgelicht artikel</Label>
      </div>

      <div>
        <Label htmlFor="keywords">Trefwoorden</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleKeywordInputKeyPress}
              placeholder="Voeg trefwoord toe en druk Enter"
              maxLength={50}
            />
            <Button 
              type="button" 
              onClick={handleAddKeyword} 
              variant="outline"
              disabled={keywords.length >= 10}
            >
              Toevoegen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-500">{keywordCount}</p>
        </div>
      </div>

      {onSubmit && (
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || validationErrors.length > 0}
            className="bg-clearbase-600 hover:bg-clearbase-700"
          >
            {isSubmitting ? (isEditing ? 'Bijwerken...' : 'Aanmaken...') : (isEditing ? 'Artikel bijwerken' : 'Artikel aanmaken')}
          </Button>
        </div>
      )}
    </form>
  );
});

ArticleForm.displayName = 'ArticleForm';

export default ArticleForm;
