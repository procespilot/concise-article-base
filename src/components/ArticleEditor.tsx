
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
      setHasUnsavedChanges(false);
    }
  }, [article]);

  // Track changes
  useEffect(() => {
    if (article) {
      const hasChanges = 
        formData.title !== article.title ||
        formData.excerpt !== (article.excerpt || "") ||
        formData.content !== article.content ||
        formData.category_id !== (article.category_id || "") ||
        JSON.stringify(formData.keywords) !== JSON.stringify(article.keywords) ||
        formData.status !== article.status ||
        formData.featured !== (article.featured || false);
      
      setHasUnsavedChanges(hasChanges);
    } else {
      // For new articles, check if any field has content
      const hasContent = 
        formData.title.trim() !== "" ||
        formData.excerpt.trim() !== "" ||
        formData.content.trim() !== "" ||
        formData.category_id !== "" ||
        formData.keywords.length > 0 ||
        formData.featured;
      
      setHasUnsavedChanges(hasContent);
    }
  }, [formData, article]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validatie fout",
        description: "Titel en inhoud zijn verplicht",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id.trim()) {
      toast({
        title: "Validatie fout",
        description: "Selecteer een categorie",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const cleanedData = {
        ...formData,
        category_id: formData.category_id.trim() || null
      };
      
      await onSave(cleanedData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt teruggaan?")) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const canSave = formData.title.trim() && formData.content.trim() && formData.category_id.trim();

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack} disabled={isSaving}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Alert className="inline-flex items-center gap-2 p-2 w-auto border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                Niet opgeslagen wijzigingen
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <Eye className="w-4 h-4" />
            {isPreview ? "Bewerken" : "Voorbeeld"}
          </Button>
          
          <Button 
            onClick={handleSave} 
            className="bg-clearbase-600 hover:bg-clearbase-700"
            disabled={!canSave || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? (isEditing ? "Bijwerken..." : "Opslaan...") : (isEditing ? "Bijwerken" : "Opslaan")}
          </Button>
        </div>
      </div>

      {categories.length === 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Er zijn nog geen categorieën beschikbaar. Voeg eerst een categorie toe om artikelen te kunnen opslaan.
          </AlertDescription>
        </Alert>
      )}

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
              {formData.keywords.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ArticleForm
              formData={formData}
              onFormDataChange={(newData) => {
                setFormData(newData);
              }}
              categories={categories}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleEditor;
