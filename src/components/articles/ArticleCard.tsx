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
  AlertTriangle
} from 'lucide-react';
import { Article } from '@/types/article';
import ArticleStatusBadge from './ArticleStatusBadge';
import ArticleActionsMenu from './ArticleActionsMenu';
import ArticleBookmarks from '../ArticleBookmarks';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'detailed';
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
  showAIHints = false, // Changed to false by default
  className = ''
}: ArticleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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
      month: 'short'
    });
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

  // Compact variant for dense lists
  if (variant === 'compact') {
    return (
      <div 
        className={`group flex items-center gap-4 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${className}`}
        onClick={handleCardClick}
        role="article"
        tabIndex={0}
        aria-label={`Artikel: ${article.title}`}
      >
        {isSelectable && (
          <div data-no-card-click className="shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectChange}
              aria-label={`Selecteer artikel: ${article.title}`}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium text-base line-clamp-1 flex-1 text-foreground">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {article.featured && (
                <Star className="h-4 w-4 text-amber-500 fill-current" />
              )}
              <ArticleStatusBadge status={article.status} size="sm" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views || 0}
            </span>
            {article.categories && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {article.categories.name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2" data-no-card-click>
          {showAIHints && aiLevel === 'high' && (
            <div className="w-2 h-2 rounded-full bg-amber-500" title="AI suggesties beschikbaar" />
          )}
          <ArticleBookmarks articleId={article.id} size="sm" />
          {isManager && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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

  // Default card variant - clean and minimal
  return (
    <Card 
      className={`group relative h-full border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer bg-card ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      tabIndex={0}
      aria-label={`Artikel: ${article.title}`}
    >
      {isSelectable && (
        <div className="absolute top-3 left-3 z-10" data-no-card-click>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            className="border-2 shadow-sm bg-background"
            aria-label={`Selecteer artikel: ${article.title}`}
          />
        </div>
      )}
      
      <CardHeader className={`pb-3 ${isSelectable ? 'pl-12' : 'pl-6'} pr-12`}>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 text-foreground leading-tight">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {article.featured && (
              <Star className="h-4 w-4 text-amber-500 fill-current" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col px-6 pb-6">
        {article.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        
        {/* Metadata footer */}
        <div className="mt-auto pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views || 0}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <ArticleStatusBadge status={article.status} size="sm" />
            </div>
          </div>
          
          {/* Category and keywords */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {article.categories && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <Tag className="h-3 w-3 mr-1" />
                  {article.categories.name}
                </Badge>
              )}
              
              {showAIHints && aiLevel !== 'low' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-primary">AI</span>
                </div>
              )}
            </div>
            
            <ArticleBookmarks articleId={article.id} size="sm" />
          </div>
          
          {/* Keywords - minimal */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.keywords.slice(0, 3).map(keyword => (
                <span key={keyword} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                  {keyword}
                </span>
              ))}
              {article.keywords.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                  +{article.keywords.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Actions - only on hover */}
      {isManager && (
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" 
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
};

export default ArticleCard;