import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Star, 
  Archive, 
  Copy, 
  GitBranch, 
  Eye, 
  Share, 
  Download,
  Trash2,
  Clock,
  Users,
  BarChart,
  Sparkles
} from 'lucide-react';
import { Article } from '@/types/article';

interface ArticleActionsMenuProps {
  article: Article;
  isManager?: boolean;
  onEdit?: (articleId: string) => void;
  onToggleFeatured?: (articleId: string) => void;
  onArchive?: (articleId: string) => void;
  onDuplicate?: (articleId: string) => void;
  onViewRevisions?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onDownload?: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
  onViewAnalytics?: (articleId: string) => void;
  onAIAction?: (action: string, articleId: string) => void;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'outline' | 'secondary';
}

const ArticleActionsMenu = ({
  article,
  isManager = false,
  onEdit,
  onToggleFeatured,
  onArchive,
  onDuplicate,
  onViewRevisions,
  onShare,
  onDownload,
  onDelete,
  onViewAnalytics,
  onAIAction,
  size = 'sm',
  variant = 'ghost'
}: ArticleActionsMenuProps) => {
  
  const buttonSize = size === 'sm' ? 'h-8 w-8 p-0' : 'h-10 w-10 p-0';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  // AI-driven suggestions based on article status and metadata
  const getAIActions = () => {
    const actions = [];
    
    // Content optimization
    if (article.title.length < 30) {
      actions.push({ label: 'Verbeter titel', action: 'improve_title' });
    }
    
    // SEO optimization
    if (!article.keywords || article.keywords.length < 3) {
      actions.push({ label: 'SEO optimaliseren', action: 'optimize_seo' });
    }
    
    // Content freshness
    const monthsOld = (Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 6) {
      actions.push({ label: 'Update suggesties', action: 'suggest_updates' });
    }
    
    // Performance analysis
    if (article.views && article.views > 100) {
      actions.push({ label: 'Analyseer prestaties', action: 'analyze_performance' });
    }
    
    return actions;
  };

  const aiActions = getAIActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={buttonSize}
          aria-label={`Acties voor artikel: ${article.title}`}
        >
          <MoreHorizontal className={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* Primary Actions */}
        <DropdownMenuItem 
          onClick={() => onEdit?.(article.id)}
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 mr-2" />
          Bewerken
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onShare?.(article.id)}>
          <Share className="h-4 w-4 mr-2" />
          Delen
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onDuplicate?.(article.id)}>
          <Copy className="h-4 w-4 mr-2" />
          Dupliceren
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Manager Actions */}
        {isManager && (
          <>
            <DropdownMenuItem 
              onClick={() => onToggleFeatured?.(article.id)}
              className="cursor-pointer"
            >
              <Star className="h-4 w-4 mr-2" />
              {article.featured ? 'Featured verwijderen' : 'Als featured markeren'}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onViewRevisions?.(article.id)}>
              <GitBranch className="h-4 w-4 mr-2" />
              Revisiegeschiedenis
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onViewAnalytics?.(article.id)}>
              <BarChart className="h-4 w-4 mr-2" />
              Analytics bekijken
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Status Actions */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock className="h-4 w-4 mr-2" />
            Status wijzigen
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Publiceren
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clock className="h-4 w-4 mr-2" />
              Concept maken
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive className="h-4 w-4 mr-2" />
              Archiveren
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* AI Actions */}
        {aiActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                AI Suggesties
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {aiActions.map((action, idx) => (
                  <DropdownMenuItem 
                    key={idx}
                    onClick={() => onAIAction?.(action.action, article.id)}
                    className="cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Export Actions */}
        <DropdownMenuItem onClick={() => onDownload?.(article.id)}>
          <Download className="h-4 w-4 mr-2" />
          Downloaden
        </DropdownMenuItem>
        
        {/* Destructive Actions */}
        {isManager && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(article.id)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijderen
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ArticleActionsMenu;