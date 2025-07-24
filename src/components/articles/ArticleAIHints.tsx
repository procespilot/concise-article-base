import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Target, 
  Copy, 
  Users, 
  Tag, 
  TrendingUp, 
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Article } from '@/types/article';

interface AIInsight {
  type: 'improve_title' | 'duplicate_content' | 'related_articles' | 'optimize_keywords' | 'update_content' | 'seo_score';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
  confidence?: number;
}

interface ArticleAIHintsProps {
  article: Article;
  compact?: boolean;
  onActionClick?: (action: string, article: Article) => void;
}

const ArticleAIHints = ({ 
  article, 
  compact = false, 
  onActionClick 
}: ArticleAIHintsProps) => {
  
  // Generate AI insights based on article data
  const generateInsights = (article: Article): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Title optimization
    if (article.title.length < 30) {
      insights.push({
        type: 'improve_title',
        severity: 'medium',
        message: 'Titel kan specifieker en SEO-vriendelijker',
        action: 'Verbeter titel',
        confidence: 75
      });
    }
    
    // Content freshness
    const monthsOld = (Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 6) {
      insights.push({
        type: 'update_content',
        severity: 'high',
        message: `Artikel is ${Math.round(monthsOld)} maanden oud, mogelijk verouderd`,
        action: 'Update inhoud',
        confidence: 85
      });
    }
    
    // Keyword optimization
    if (!article.keywords || article.keywords.length < 3) {
      insights.push({
        type: 'optimize_keywords',
        severity: 'low',
        message: 'Voeg meer relevante keywords toe voor betere vindbaarheid',
        action: 'Voeg keywords toe',
        confidence: 60
      });
    }
    
    // Content length check
    if (article.content && article.content.length < 500) {
      insights.push({
        type: 'improve_title',
        severity: 'medium',
        message: 'Artikel is kort, overweeg meer detail toe te voegen',
        action: 'Uitbreiden',
        confidence: 70
      });
    }
    
    // SEO score simulation
    const seoScore = Math.floor(Math.random() * 40) + 60; // 60-100
    if (seoScore < 80) {
      insights.push({
        type: 'seo_score',
        severity: seoScore < 70 ? 'high' : 'medium',
        message: `SEO score: ${seoScore}/100. Verbeter voor meer zichtbaarheid`,
        action: 'SEO optimaliseren',
        confidence: 90
      });
    }
    
    return insights;
  };

  const insights = generateInsights(article);
  const highPriorityInsights = insights.filter(i => i.severity === 'high');
  
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'improve_title':
        return Target;
      case 'duplicate_content':
        return Copy;
      case 'related_articles':
        return Users;
      case 'optimize_keywords':
        return Tag;
      case 'update_content':
        return TrendingUp;
      case 'seo_score':
        return CheckCircle;
      default:
        return Lightbulb;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Info;
      case 'low':
        return CheckCircle;
      default:
        return Info;
    }
  };

  if (insights.length === 0) {
    return null;
  }

  // Compact view for cards
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
          <span className="text-xs font-medium text-primary">AI Suggesties</span>
          {highPriorityInsights.length > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
              {highPriorityInsights.length}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          {insights.slice(0, 2).map((insight, idx) => {
            const Icon = getInsightIcon(insight.type);
            const SeverityIcon = getSeverityIcon(insight.severity);
            
            return (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-2 text-xs p-2 rounded border ${getSeverityColor(insight.severity)} cursor-help`}>
                      <SeverityIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate flex-1">{insight.message}</span>
                      {insight.confidence && (
                        <span className="text-xs opacity-75">{insight.confidence}%</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{insight.message}</p>
                    {insight.action && (
                      <p className="text-xs mt-1 opacity-75">Actie: {insight.action}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          
          {insights.length > 2 && (
            <div className="text-xs text-muted-foreground text-center py-1">
              +{insights.length - 2} meer
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full view for expanded display
  return (
    <div className="space-y-3" role="region" aria-label="AI-gegenereerde suggesties">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-medium text-primary">AI Suggesties</h3>
        {highPriorityInsights.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {highPriorityInsights.length} urgent
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        {insights.map((insight, idx) => {
          const Icon = getInsightIcon(insight.type);
          const SeverityIcon = getSeverityIcon(insight.severity);
          
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-center gap-2 mt-0.5">
                <SeverityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">{insight.message}</p>
                {insight.confidence && (
                  <p className="text-xs opacity-75 mb-2">
                    Zekerheid: {insight.confidence}%
                  </p>
                )}
                
                {insight.action && onActionClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => onActionClick(insight.action!, article)}
                    aria-label={`${insight.action} voor artikel ${article.title}`}
                  >
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleAIHints;