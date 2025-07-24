import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter,
  BookOpen,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface ArticleListEmptyStateProps {
  type?: 'no_articles' | 'no_results' | 'no_access';
  searchQuery?: string;
  activeFilters?: string[];
  onCreateArticle?: () => void;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  isManager?: boolean;
}

const ArticleListEmptyState = ({
  type = 'no_articles',
  searchQuery,
  activeFilters = [],
  onCreateArticle,
  onClearFilters,
  onClearSearch,
  isManager = false
}: ArticleListEmptyStateProps) => {
  
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no_results':
        return {
          icon: Search,
          title: 'Geen resultaten gevonden',
          description: searchQuery 
            ? `Geen artikelen gevonden voor "${searchQuery}"`
            : 'Geen artikelen gevonden met de huidige filters',
          suggestions: [
            'Probeer andere zoektermen',
            'Controleer de spelling',
            'Verwijder enkele filters',
            'Zoek op trefwoorden in plaats van volledige zinnen'
          ],
          actions: [
            ...(searchQuery ? [{ label: 'Zoekopdracht wissen', action: onClearSearch, variant: 'outline' as const }] : []),
            ...(activeFilters.length > 0 ? [{ label: 'Filters wissen', action: onClearFilters, variant: 'outline' as const }] : [])
          ]
        };
        
      case 'no_access':
        return {
          icon: BookOpen,
          title: 'Geen toegang tot artikelen',
          description: 'Je hebt momenteel geen toegang tot artikelen in dit systeem',
          suggestions: [
            'Neem contact op met je administrator',
            'Controleer je accountrechten',
            'Mogelijk moet je nog geactiveerd worden'
          ],
          actions: []
        };
        
      default: // no_articles
        return {
          icon: FileText,
          title: 'Nog geen artikelen',
          description: isManager 
            ? 'Begin met het maken van je eerste artikel om je kennisbank op te bouwen'
            : 'Er zijn nog geen artikelen beschikbaar in dit systeem',
          suggestions: isManager ? [
            'Maak je eerste artikel aan',
            'Importeer bestaande content',
            'Stel categorieën in voor betere organisatie',
            'Nodig teamleden uit om bij te dragen'
          ] : [
            'Wacht tot er content wordt toegevoegd',
            'Neem contact op met je administrator',
            'Bekijk beschikbare categorieën'
          ],
          actions: isManager ? [
            { label: 'Eerste artikel maken', action: onCreateArticle, variant: 'default' as const },
            { label: 'Categorieën beheren', action: () => {}, variant: 'outline' as const }
          ] : []
        };
    }
  };

  const content = getEmptyStateContent();
  const Icon = content.icon;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="py-16 px-8 text-center">
        <div className="mx-auto max-w-md">
          {/* Icon */}
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {content.title}
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6">
            {content.description}
          </p>
          
          {/* Suggestions */}
          {content.suggestions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Suggesties
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-xs mx-auto">
                {content.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          {content.actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {content.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.action}
                  className="flex items-center gap-2"
                >
                  {action.variant === 'default' && <Plus className="h-4 w-4" />}
                  {action.variant === 'outline' && action.label.includes('Filter') && <Filter className="h-4 w-4" />}
                  {action.variant === 'outline' && action.label.includes('Zoek') && <Search className="h-4 w-4" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Additional context for search/filter states */}
          {(searchQuery || activeFilters.length > 0) && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                {searchQuery && (
                  <p>Zoekterm: <span className="font-medium">"{searchQuery}"</span></p>
                )}
                {activeFilters.length > 0 && (
                  <p>Actieve filters: <span className="font-medium">{activeFilters.join(', ')}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleListEmptyState;