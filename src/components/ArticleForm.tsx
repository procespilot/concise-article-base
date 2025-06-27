
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string;
    status: string;
    featured: boolean;
    keywords: string[];
  }) => Promise<boolean>;
  categories: Category[];
  initialData?: Article;
  isEditing?: boolean;
}

const ArticleForm = ({ isOpen, onClose, onSubmit, categories, initialData, isEditing = false }: ArticleFormProps) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('Concept');
  const [featured, setFeatured] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log('Populating form with initial data:', initialData);
      setTitle(initialData.title || '');
      setExcerpt(initialData.excerpt || '');
      setContent(initialData.content || '');
      setCategoryId(initialData.category_id || '');
      setStatus(initialData.status || 'Concept');
      setFeatured(initialData.featured || false);
      setKeywords(initialData.keywords || []);
    } else {
      // Reset form when not editing
      setTitle('');
      setExcerpt('');
      setContent('');
      setCategoryId('');
      setStatus('Concept');
      setFeatured(false);
      setKeywords([]);
    }
  }, [initialData, isOpen]);

  const handleAddKeyword = () => {
    const trimmedKeyword = keywordInput.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      console.log('Form validation failed - missing required fields');
      return;
    }

    console.log('Submitting article form:', {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category_id: categoryId,
      status,
      featured,
      keywords
    });

    setIsSubmitting(true);

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

      if (success) {
        console.log('Article submitted successfully');
        onClose();
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Artikel bewerken' : 'Nieuw artikel'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Artikel titel"
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Samenvatting</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Korte samenvatting van het artikel"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content">Inhoud *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Artikel inhoud"
              rows={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categorie *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
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
            <Select value={status} onValueChange={setStatus}>
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
              onCheckedChange={(checked) => setFeatured(checked as boolean)}
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
                />
                <Button type="button" onClick={handleAddKeyword} variant="outline">
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
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}>
              {isSubmitting ? (isEditing ? 'Bijwerken...' : 'Aanmaken...') : (isEditing ? 'Artikel bijwerken' : 'Artikel aanmaken')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleForm;
