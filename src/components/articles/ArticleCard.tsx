import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Eye, 
  Tag, 
  Star, 
  ExternalLink,
  Calendar,
  MessageSquare,
  Sparkles,
  User,
  Edit2,
  MoreHorizontal
} from 'lucide-react';
import { Article } from '@/types/article';
import ArticleStatusBadge from './ArticleStatusBadge';
import ArticleActionsMenu from './ArticleActionsMenu';
import ArticleBookmarks from '../ArticleBookmarks';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'list';
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (articleId: string, selected: boolean) => void;
  onClick?: (articleId: string) => void;
  onEdit?: (articleId: string) => void;
  onToggleFeatured?: (articleId: string) => void;
  onAIAction?: (action: string, articleId: string) => void;
  isManager?: boolean;
  showAIHints?: boolean;
  className?: string;
}

const ArticleCard = ({
  article,
  variant = 'default',
  isSelectable = false,
  isSelected = false,
  onSelect,
  onClick,
  onEdit,
  onToggleFeatured,
  onAIAction,
  isManager = false,
  showAIHints = false,
  className = ''
}: ArticleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-card-click]')) {
      return;
    }
    onClick?.(article.id);
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect?.(article.id, checked);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSnippet = (content: string, maxLength: number = 120) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Gepubliceerd':
        return 'published';
      case 'Concept': 
        return 'draft';
      case 'Archief':
        return 'archived';
      default:
        return 'default';
    }
  };

  // Simple AI insight indicator
  const getAIInsightLevel = () => {
    const monthsOld = (Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const hasKeywords = article.keywords && article.keywords.length >= 3;
    const titleLength = article.title.length;
    
    if (monthsOld > 6 || titleLength < 30) return 'high';
    if (!hasKeywords) return 'medium';
    return 'low';
  };

  const aiLevel = getAIInsightLevel();

  // List variant with column structure
  if (variant === 'list') {
    return (
      <div 
        className={`group flex items-center gap-4 p-4 border-b border-border/30 hover:bg-muted/20 transition-all duration-200 cursor-pointer animate-fade-in ${className}`}
        onClick={handleCardClick}
        role="article"
        tabIndex={0}
        aria-label={`Artikel: ${article.title}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Checkbox */}
        {isSelectable && (
          <div data-no-card-click className="shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectChange}
              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              aria-label={`Selecteer artikel: ${article.title}`}
            />
          </div>
        )}
        
        {/* Status Badge - prominent position */}
        <div className="w-24 shrink-0">
          <ArticleStatusBadge status={article.status} size="sm" showIcon />
        </div>
        
        {/* Title & Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-1">
            <h3 
              className="font-bold text-lg text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(article.id);
              }}
              title="Klik om te bewerken"
            >
              {article.title}
            </h3>
            {article.featured && (
              <Star className="h-5 w-5 text-amber-500 fill-current shrink-0" />
            )}
          </div>
          
          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {article.excerpt || getSnippet(article.content)}
          </p>
          
          {/* Metadata row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Auteur</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views || 0}
            </span>
          </div>
        </div>
        
        {/* Category */}
        <div className="w-32 shrink-0">
          {article.categories && (
            <Badge variant="secondary" className="text-xs font-medium">
              {article.categories.name}
            </Badge>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 w-24 justify-end" data-no-card-click>
          {showAIHints && aiLevel === 'high' && (
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="AI suggesties beschikbaar" />
          )}
          <ArticleBookmarks articleId={article.id} size="sm" />
          {isManager && (
            <div className={`transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <ArticleActionsMenu
                article={article}
                isManager={isManager}
                onEdit={onEdit}
                onToggleFeatured={onToggleFeatured}
                onAIAction={onAIAction}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact variant for dense grids
  if (variant === 'compact') {
    return (
      <Card 
        className={`group relative hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-border animate-scale-in ${
          article.status === 'Concept' ? 'bg-amber-50/30 border-amber-200/50' :
          article.status === 'Gepubliceerd' ? 'bg-emerald-50/30 border-emerald-200/50' :
          'bg-card'
        } ${className}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        tabIndex={0}
        aria-label={`Artikel: ${article.title}`}
      >
        {/* Status Badge - top left */}
        <div className="absolute top-3 left-3 z-10">
          <ArticleStatusBadge status={article.status} size="sm" />
        </div>
        
        {/* Checkbox - only when selectable */}
        {isSelectable && (
          <div className="absolute top-3 right-12 z-10" data-no-card-click>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectChange}
              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm bg-background"
              aria-label={`Selecteer artikel: ${article.title}`}
            />
          </div>
        )}

        <CardHeader className="pb-3 pt-12 px-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle 
              className="text-xl font-bold line-clamp-2 flex-1 text-foreground leading-tight hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(article.id);
              }}
              title="Klik om te bewerken"
            >
              {article.title}
            </CardTitle>
            {article.featured && (
              <Star className="h-5 w-5 text-amber-500 fill-current shrink-0" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 px-4 pb-4">
          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {article.excerpt || getSnippet(article.content)}
          </p>
          
          {/* Author & Date */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Auteur</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.created_at)}
            </span>
          </div>
          
          {/* Bottom row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {article.views || 0}
              </span>
              
              {article.categories && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {article.categories.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showAIHints && aiLevel !== 'low' && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
              )}
              <ArticleBookmarks articleId={article.id} size="sm" />
            </div>
          </div>
        </CardContent>
        
        {/* Actions - only on hover */}
        {isManager && (
          <div 
            className={`absolute top-3 right-3 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            data-no-card-click
          >
            <ArticleActionsMenu
              article={article}
              isManager={isManager}
              onEdit={onEdit}
              onToggleFeatured={onToggleFeatured}
              onAIAction={onAIAction}
              variant="ghost"
              size="sm"
            />
          </div>
        )}
      </Card>
    );
  }

  // Default grid card - enhanced version
  return (
    <Card 
      className={`group relative h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-border hover-scale animate-fade-in ${
        article.status === 'Concept' ? 'bg-amber-50/20 border-amber-200/30' :
        article.status === 'Gepubliceerd' ? 'bg-emerald-50/20 border-emerald-200/30' :
        'bg-card'
      } ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      tabIndex={0}
      aria-label={`Artikel: ${article.title}`}
    >
      {/* Status Badge - prominent top left */}
      <div className="absolute top-4 left-4 z-10">
        <ArticleStatusBadge status={article.status} size="md" showIcon />
      </div>
      
      {/* Featured Star */}
      {article.featured && (
        <div className="absolute top-4 right-4 z-10">
          <Star className="h-5 w-5 text-amber-500 fill-current drop-shadow-sm" />
        </div>
      )}
      
      {/* Checkbox */}
      {isSelectable && (
        <div className="absolute top-4 right-12 z-10" data-no-card-click>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-md bg-background"
            aria-label={`Selecteer artikel: ${article.title}`}
          />
        </div>
      )}

      <CardHeader className="pb-4 pt-16 px-6">
        <CardTitle 
          className="text-2xl font-bold line-clamp-2 text-foreground leading-tight hover:text-primary transition-colors cursor-pointer group-hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(article.id);
          }}
          title="Klik om te bewerken"
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col px-6 pb-6">
        {/* Article Snippet */}
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1 min-h-[3.5rem]">
          {article.excerpt || getSnippet(article.content)}
        </p>
        
        {/* Author & Date Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">Auteur</span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.created_at)}</span>
          </span>
        </div>
        
        {/* Bottom section */}
        <div className="mt-auto pt-4 space-y-3 border-t border-border/30">
          {/* Stats & Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{article.views || 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>0</span>
              </span>
            </div>
            
            {article.categories && (
              <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                <Tag className="h-3 w-3 mr-1" />
                {article.categories.name}
              </Badge>
            )}
          </div>
          
          {/* Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showAIHints && aiLevel !== 'low' && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="h-3 w-3" />
                  <span className="font-medium">AI</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2" data-no-card-click>
              <ArticleBookmarks articleId={article.id} size="sm" />
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(article.id);
                }}
                aria-label="Open artikel"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Quick Actions Menu */}
      {isManager && (
        <div 
          className={`absolute bottom-4 right-4 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          data-no-card-click
        >
          <ArticleActionsMenu
            article={article}
            isManager={isManager}
            onEdit={onEdit}
            onToggleFeatured={onToggleFeatured}
            onAIAction={onAIAction}
            variant="secondary"
            size="sm"
          />
        </div>
      )}
    </Card>
  );
};

export default ArticleCard;