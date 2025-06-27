
import { useState } from "react";
import { ArrowLeft, Clock, Eye, Star, User, Tag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ArticleDetailProps {
  article: any;
  onBack: () => void;
  onEdit?: () => void;
}

const ArticleDetail = ({ article, onBack, onEdit }: ArticleDetailProps) => {
  const [rating, setRating] = useState(0);

  if (!article) {
    return (
      <div className="animate-fade-in">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Artikel niet gevonden</h2>
          <p className="text-gray-600 mt-2">Het artikel dat je zoekt bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  const handleRating = (score: number) => {
    setRating(score);
    console.log(`Artikel ${article.id} beoordeeld met ${score} sterren`);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        {onEdit && (
          <Button onClick={onEdit} className="bg-clearbase-600 hover:bg-clearbase-700">
            <Edit className="w-4 h-4 mr-2" />
            Bewerken
          </Button>
        )}
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
          
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
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

        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              {article.excerpt && (
                <p className="text-lg text-gray-700 mb-6">{article.excerpt}</p>
              )}
              <div className="space-y-4 text-gray-800">
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Was dit artikel nuttig?</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  Bedankt voor je beoordeling!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
};

export default ArticleDetail;
