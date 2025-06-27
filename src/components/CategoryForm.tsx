
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from "@/utils/sanitization";
import { handleError, getSupabaseErrorMessage } from "@/utils/errorHandling";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

const CategoryForm = ({ isOpen, onClose, onCategoryAdded }: CategoryFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validatie fout",
        description: "Categorienaam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = {
        name: sanitizeInput(name.trim()),
        description: description.trim() ? sanitizeInput(description.trim()) : null
      };

      const { error } = await supabase
        .from('categories')
        .insert([sanitizedData]);

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      toast({
        title: "Categorie toegevoegd",
        description: "De nieuwe categorie is succesvol toegevoegd"
      });

      // Reset form
      setName('');
      setDescription('');
      
      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error('Error adding category:', error);
      handleError(getSupabaseErrorMessage(error), toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string>>,
    maxLength?: number
  ) => {
    const sanitized = sanitizeInput(value);
    const trimmed = maxLength ? sanitized.substring(0, maxLength) : sanitized;
    setter(trimmed);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuwe categorie toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Naam *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleInputChange(e.target.value, setName, 100)}
              placeholder="Categorienaam"
              required
              maxLength={100}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => handleInputChange(e.target.value, setDescription, 500)}
              placeholder="Optionele beschrijving van de categorie"
              rows={3}
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Toevoegen...' : 'Categorie toevoegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
