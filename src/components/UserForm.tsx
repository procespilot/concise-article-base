
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Fout",
        description: "Email is verplicht",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new user profile manually
      const newUserId = crypto.randomUUID();
      
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          email: email.trim(),
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null
        });

      if (profileError) throw profileError;

      // Assign role to the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUserId,
          role: role
        });

      if (roleError) throw roleError;

      toast({
        title: "Gebruiker toegevoegd",
        description: "De nieuwe gebruiker is succesvol toegevoegd"
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('user');
      
      onUserAdded();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Fout bij toevoegen gebruiker",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuwe gebruiker toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Voornaam</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Voornaam"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Achternaam"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gebruiker@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefoon</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+31 6 12345678"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Toevoegen...' : 'Gebruiker toevoegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
