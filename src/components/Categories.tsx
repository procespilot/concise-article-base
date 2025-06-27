
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, FileText, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { handleError, getSupabaseErrorMessage } from "@/utils/errorHandling";

interface CategoriesProps {
  categories: any[];
  articles: any[];
  onRefresh: () => void;
  onCreateCategory?: () => void;
}

const Categories = ({ categories, articles, onRefresh, onCreateCategory }: CategoriesProps) => {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const getCategoryArticleCount = (categoryId: string) => {
    return articles.filter(article => article.category_id === categoryId).length;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const articleCount = getCategoryArticleCount(categoryId);
    if (articleCount > 0) {
      toast({
        title: "Kan categorie niet verwijderen",
        description: `Deze categorie bevat nog ${articleCount} artikel(en). Verwijder eerst alle artikelen uit deze categorie.`,
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      toast({
        title: "Categorie verwijderd",
        description: "De categorie is succesvol verwijderd"
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      handleError(getSupabaseErrorMessage(error), toast);
    } finally {
      setIsDeleting(false);
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-8 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-black mb-2">Categorieën</h1>
          <p className="text-gray-600">Beheer je content categorieën</p>
        </div>
        {onCreateCategory && (
          <Button onClick={onCreateCategory} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Categorie
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium mb-2 text-gray-800">Geen categorieën gevonden</h3>
          <p className="text-gray-600 mb-6">
            Voeg je eerste categorie toe om je artikelen te organiseren
          </p>
          {onCreateCategory && (
            <Button onClick={onCreateCategory} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Eerste Categorie Toevoegen
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const articleCount = getCategoryArticleCount(category.id);
            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-black flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-gray-400" />
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingCategory(category.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      disabled={articleCount > 0}
                      title={articleCount > 0 ? "Kan niet verwijderen: bevat artikelen" : "Categorie verwijderen"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{articleCount} artikel{articleCount !== 1 ? 'en' : ''}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(category.created_at).toLocaleDateString('nl-NL')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Categorie verwijderen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze categorie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategory && handleDeleteCategory(deletingCategory)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
