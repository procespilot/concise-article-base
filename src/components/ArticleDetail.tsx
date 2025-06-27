
import { useState } from "react";
import { ArrowLeft, Clock, Eye, Star, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";

interface ArticleDetailProps {
  articleId: number;
  onBack: () => void;
}

const ArticleDetail = ({ articleId, onBack }: ArticleDetailProps) => {
  const { articles } = useUser();
  const [rating, setRating] = useState(0);
  
  const article = articles.find(a => a.id === articleId);

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
    // In a real app, this would save to backend
    console.log(`Artikel ${articleId} beoordeeld met ${score} sterren`);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Terug naar overzicht
      </Button>

      <article className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {article.featured && (
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            )}
            <Badge variant="secondary">{article.category}</Badge>
            <Badge variant={article.status === "Gepubliceerd" ? "default" : "outline"}>
              {article.status}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Laatst bijgewerkt: {new Date(article.updatedAt).toLocaleDateString('nl-NL')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views} weergaven</span>
            </div>
          </div>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            {article.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">{article.excerpt}</p>
              <div className="space-y-4 text-gray-800">
                {/* Simulated article content */}
                <p>{article.content}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                  sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
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
