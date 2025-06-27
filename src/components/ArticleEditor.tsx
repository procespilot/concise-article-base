
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import ArticleForm from "./ArticleForm";

interface ArticleEditorProps {
  articleId?: number;
  onBack: () => void;
  onSave: () => void;
}

const ArticleEditor = ({ articleId, onBack, onSave }: ArticleEditorProps) => {
  const { articles, categories } = useUser();
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    keywords: [] as string[],
    status: "Concept" as "Concept" | "Gepubliceerd",
    featured: false
  });

  const isEditing = Boolean(articleId);
  const article = articleId ? articles.find(a => a.id === articleId) : null;

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        keywords: article.keywords,
        status: article.status as "Concept" | "Gepubliceerd",
        featured: article.featured || false
      });
    }
  }, [article]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validatie fout",
        description: "Titel en inhoud zijn verplicht",
        variant: "destructive"
      });
      return;
    }

    // In een echte app zou dit naar de backend gaan
    console.log("Artikel opslaan:", formData);
    
    toast({
      title: isEditing ? "Artikel bijgewerkt" : "Artikel aangemaakt",
      description: `${formData.title} is succesvol ${isEditing ? 'bijgewerkt' : 'aangemaakt'}`,
    });

    onSave();
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? "Bewerken" : "Voorbeeld"}
          </Button>
          <Button onClick={handleSave} className="bg-clearbase-600 hover:bg-clearbase-700">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Bijwerken" : "Opslaan"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Artikel bewerken" : "Nieuw artikel"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPreview ? (
            <div className="prose max-w-none">
              <h1 className="text-3xl font-bold mb-4">{formData.title || "Artikel titel"}</h1>
              <p className="text-lg text-gray-600 mb-6">{formData.excerpt}</p>
              <div className="whitespace-pre-wrap">{formData.content}</div>
            </div>
          ) : (
            <ArticleForm
              formData={formData}
              onFormDataChange={setFormData}
              categories={categories}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleEditor;
