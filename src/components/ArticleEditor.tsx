
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ArticleForm from "./ArticleForm";

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
  onSave: (articleData: any) => Promise<void>;
  articles: any[];
  categories: any[];
}

const ArticleEditor = ({ articleId, onBack, onSave, articles, categories }: ArticleEditorProps) => {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category_id: "",
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
        excerpt: article.excerpt || "",
        content: article.content,
        category_id: article.category_id || "",
        keywords: article.keywords,
        status: article.status as "Concept" | "Gepubliceerd",
        featured: article.featured || false
      });
    }
  }, [article]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validatie fout",
        description: "Titel en inhoud zijn verplicht",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving article:', error);
    }
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
              {formData.excerpt && <p className="text-lg text-gray-600 mb-6">{formData.excerpt}</p>}
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
