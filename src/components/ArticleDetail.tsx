
import { useState } from "react";
import { ArrowLeft, Clock, Eye, Star, User, Tag, Edit, Share2, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ArticleDetailProps {
  article: any;
  onBack: () => void;
  onEdit?: () => void;
}

const ArticleDetail = ({ article, onBack, onEdit }: ArticleDetailProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!article) {
    return (
      <div className="animate-fade-in">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Artikel niet gevonden</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Het artikel dat je zoekt bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  const handleRating = (score: number) => {
    setRating(score);
    console.log(`Artikel ${article.id} beoordeeld met ${score} sterren`);
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    console.log(`Artikel ${article.id} feedback: ${type}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    console.log(`Artikel ${article.id} ${isBookmarked ? 'uit bookmarks verwijderd' : 'aan bookmarks toegevoegd'}`);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Artikel delen</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleBookmark}
                className={isBookmarked ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isBookmarked ? 'Uit bookmarks verwijderen' : 'Aan bookmarks toevoegen'}</p>
            </TooltipContent>
          </Tooltip>

          {onEdit && (
            <Button onClick={onEdit} className="bg-clearbase-600 hover:bg-clearbase-700">
              <Edit className="w-4 h-4 mr-2" />
              Bewerken
            </Button>
          )}
        </div>
      </div>

      <article className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {article.featured && (
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            )}
            <Badge variant="secondary">
              {article.categories ? article.categories.name : 'Geen categorie'}
            </Badge>
            <Badge variant={article.status === "Gepubliceerd" ? "default" : "outline"}>
              {article.status}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>
                {article.profiles 
                  ? `${article.profiles.first_name || ''} ${article.profiles.last_name || ''}`.trim() || 'Onbekend'
                  : 'Onbekend'
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Laatst bijgewerkt: {new Date(article.updated_at).toLocaleDateString('nl-NL')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views} weergaven</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            {article.keywords.map((keyword: string) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="prose max-w-none dark:prose-invert">
              {article.excerpt && (
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 font-medium">{article.excerpt}</p>
              )}
              <div className="space-y-4 text-gray-800 dark:text-gray-200">
                <div className="whitespace-pre-wrap leading-relaxed">{article.content}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Was dit artikel nuttig?</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  onClick={() => handleFeedback('helpful')}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Ja, nuttig
                </Button>
                <Button
                  variant={feedback === 'not-helpful' ? 'destructive' : 'outline'}
                  onClick={() => handleFeedback('not-helpful')}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Niet nuttig
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Beoordeling:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`w-6 h-6 transition-colors ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                    } hover:text-yellow-400`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Bedankt voor je beoordeling!
                  </span>
                )}
              </div>
              
              {feedback && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {feedback === 'helpful' 
                    ? "Dank je wel! Je feedback helpt ons om betere content te maken." 
                    : "Bedankt voor je feedback. We zullen dit artikel verbeteren."
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
};

export default ArticleDetail;
