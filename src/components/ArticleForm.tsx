
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string[];
  status: "Concept" | "Gepubliceerd";
  featured: boolean;
}

interface ArticleFormProps {
  formData: ArticleFormData;
  onFormDataChange: (data: ArticleFormData) => void;
  categories: string[];
}

const ArticleForm = ({ formData, onFormDataChange, categories }: ArticleFormProps) => {
  const [newKeyword, setNewKeyword] = useState("");

  const updateFormData = (field: keyof ArticleFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      updateFormData("keywords", [...formData.keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    updateFormData("keywords", formData.keywords.filter(k => k !== keyword));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              placeholder="Voer de titel van het artikel in"
              className="text-lg font-medium"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Samenvatting</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => updateFormData("excerpt", e.target.value)}
              placeholder="Korte beschrijving van het artikel"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="content">Inhoud *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => updateFormData("content", e.target.value)}
              placeholder="Schrijf de volledige inhoud van het artikel..."
              className="min-h-[400px] resize-y"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Concept" | "Gepubliceerd") => updateFormData("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Concept">Concept</SelectItem>
                <SelectItem value="Gepubliceerd">Gepubliceerd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateFormData("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => updateFormData("featured", checked)}
            />
            <Label htmlFor="featured">Uitgelicht artikel</Label>
          </div>

          <div>
            <Label>Keywords</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Voeg keyword toe"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;
