
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, validateEmail, validatePhone } from "@/utils/sanitization";
import { validateUserData } from "@/utils/validation";
import { handleError, getSupabaseErrorMessage } from "@/utils/errorHandling";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const UserForm = ({ isOpen, onClose, onUserAdded }: UserFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'manager' | 'admin'>('user');
  const [autoActivate, setAutoActivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateForm = () => {
    const userData = {
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim()
    };

    const validation = validateUserData(userData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize all inputs
      const sanitizedData = {
        email: sanitizeInput(email.trim()),
        firstName: sanitizeInput(firstName.trim()),
        lastName: sanitizeInput(lastName.trim()),
        phone: sanitizeInput(phone.trim())
      };

      // Additional validation
      if (!validateEmail(sanitizedData.email)) {
        toast({
          title: "Validatie fout",
          description: "Ongeldig email formaat",
          variant: "destructive"
        });
        return;
      }

      if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
        toast({
          title: "Validatie fout",
          description: "Ongeldig telefoonnummer formaat",
          variant: "destructive"
        });
        return;
      }

      // Use the secure database function to create user
      const { data, error } = await supabase.rpc('create_user_with_role', {
        p_email: sanitizedData.email,
        p_first_name: sanitizedData.firstName || null,
        p_last_name: sanitizedData.lastName || null,
        p_phone: sanitizedData.phone || null,
        p_role: role,
        p_auto_activate: autoActivate
      });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Type-safe check for the function response
      const result = data as { 
        error?: string; 
        success?: boolean; 
        user_id?: string;
        activation_token?: string;
        requires_activation?: boolean;
      };
      
      if (result && result.error) {
        throw new Error(result.error);
      }

      // Show appropriate success message based on activation status
      if (result.requires_activation && result.activation_token) {
        toast({
          title: "Gebruiker aangemaakt",
          description: `Gebruiker aangemaakt maar moet nog geactiveerd worden. Activation token: ${result.activation_token.substring(0, 8)}...`
        });
      } else {
        toast({
          title: "Gebruiker toegevoegd",
          description: "De nieuwe gebruiker is succesvol toegevoegd en geactiveerd"
        });
      }

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('user');
      setAutoActivate(true);
      setValidationErrors([]);
      
      onUserAdded();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
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
    
    // Clear validation errors when user types
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuwe gebruiker toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Voornaam</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => handleInputChange(e.target.value, setFirstName, 50)}
                placeholder="Voornaam"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => handleInputChange(e.target.value, setLastName, 50)}
                placeholder="Achternaam"
                maxLength={50}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleInputChange(e.target.value, setEmail, 254)}
              placeholder="gebruiker@example.com"
              required
              maxLength={254}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefoon</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => handleInputChange(e.target.value, setPhone, 20)}
              placeholder="+31 6 12345678"
              maxLength={20}
            />
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value: 'user' | 'manager' | 'admin') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Gebruiker</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoActivate"
              checked={autoActivate}
              onCheckedChange={(checked) => setAutoActivate(checked as boolean)}
            />
            <Label htmlFor="autoActivate" className="text-sm">
              Automatisch activeren
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !email.trim() || validationErrors.length > 0}
            >
              {isSubmitting ? 'Toevoegen...' : 'Gebruiker toevoegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
