import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Eye, 
  User, 
  Tag, 
  Star, 
  ExternalLink,
  Calendar,
  MessageSquare 
} from 'lucide-react';
import { Article } from '@/types/article';
import ArticleStatusBadge from './ArticleStatusBadge';
import ArticleActionsMenu from './ArticleActionsMenu';
import ArticleAIHints from './ArticleAIHints';
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
  showAIHints = true,
  className = ''
}: ArticleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click when interacting with action buttons
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

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  // Compact variant for list views
  if (variant === 'compact') {
    return (
      <Card 
        className={`hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 ${className}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        tabIndex={0}
        aria-label={`Artikel: ${article.title}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
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
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-base line-clamp-1 flex-1">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  {article.featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" aria-label="Featured artikel" />
                  )}
                  <ArticleStatusBadge status={article.status} size="sm" />
                </div>
              </div>
              
              {article.excerpt && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" aria-hidden="true" />
                    <span>{article.views || 0}</span>
                  </div>
                  {article.categories && (
                    <Badge variant="outline" className="text-xs">
                      {article.categories.name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1" data-no-card-click>
                  <ArticleBookmarks articleId={article.id} size="sm" />
                  {isManager && (
                    <ArticleActionsMenu
                      article={article}
                      isManager={isManager}
                      onEdit={onEdit}
                      onToggleFeatured={onToggleFeatured}
                      onAIAction={onAIAction}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant with AI hints
  if (variant === 'detailed') {
    return (
      <Card 
        className={`hover:shadow-lg transition-all duration-200 cursor-pointer group relative ${className}`}
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
              className="bg-background shadow-sm border-2"
              aria-label={`Selecteer artikel: ${article.title}`}
            />
          </div>
        )}
        
        <CardHeader className="pb-3 pr-12">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 flex-1">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              {article.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" aria-label="Featured artikel" />
              )}
              <ArticleStatusBadge status={article.status} showIcon />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {article.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {article.excerpt}
            </p>
          )}
          
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>Gemaakt: {formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>Bijgewerkt: {formatDate(article.updated_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{article.views || 0} weergaven</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" aria-hidden="true" />
              <span>{getReadingTime(article.content)} min lezen</span>
            </div>
          </div>
          
          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.keywords.slice(0, 4).map(keyword => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {article.keywords.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{article.keywords.length - 4}
                </Badge>
              )}
            </div>
          )}
          
          {/* Category */}
          {article.categories && (
            <div className="pt-2 border-t border-border">
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                {article.categories.name}
              </Badge>
            </div>
          )}
          
          {/* AI Hints */}
          {showAIHints && (
            <div className="pt-2 border-t border-border">
              <ArticleAIHints 
                article={article} 
                compact 
                onActionClick={(action) => onAIAction?.(action, article.id)}
              />
            </div>
          )}
        </CardContent>
        
        {/* Actions Menu - positioned absolutely */}
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
              variant="secondary"
            />
          </div>
        )}
        
        {/* Bottom Actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1" data-no-card-click>
          <ArticleBookmarks articleId={article.id} size="sm" />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer group relative h-full ${className}`}
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
            className="bg-background shadow-sm border-2"
            aria-label={`Selecteer artikel: ${article.title}`}
          />
        </div>
      )}
      
      <CardHeader className="pb-3 pr-12">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 flex-1">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {article.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" aria-label="Featured artikel" />
            )}
            <ArticleStatusBadge status={article.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {article.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{article.views || 0}</span>
            </div>
          </div>
          
          <ArticleBookmarks articleId={article.id} size="sm" />
        </div>
        
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.keywords.slice(0, 3).map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {article.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.keywords.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {article.categories && (
          <div className="pt-2 border-t border-border">
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
              {article.categories.name}
            </Badge>
          </div>
        )}
        
        {showAIHints && (
          <div className="pt-2 border-t border-border">
            <ArticleAIHints 
              article={article} 
              compact 
              onActionClick={(action) => onAIAction?.(action, article.id)} 
            />
          </div>
        )}
      </CardContent>
      
      {/* Actions Menu */}
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
            variant="secondary"
          />
        </div>
      )}
    </Card>
  );
};

export default ArticleCard;