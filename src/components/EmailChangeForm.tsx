
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { sanitizeInput, validateEmail } from '@/utils/sanitization';

interface EmailChangeFormProps {
  currentEmail: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

const EmailChangeForm = ({ currentEmail, onBack, onSuccess }: EmailChangeFormProps) => {
  const [formData, setFormData] = useState({
    newEmail: '',
    confirmEmail: '',
    currentPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.newEmail) {
      newErrors.push('Nieuw email adres is verplicht');
    } else if (!validateEmail(formData.newEmail)) {
      newErrors.push('Ongeldig email formaat');
    }

    if (formData.newEmail !== formData.confirmEmail) {
      newErrors.push('Email adressen komen niet overeen');
    }

    if (formData.newEmail === currentEmail) {
      newErrors.push('Nieuw email adres moet verschillen van het huidige');
    }

    if (!formData.currentPassword) {
      newErrors.push('Huidig wachtwoord is verplicht voor verificatie');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: formData.currentPassword
      });

      if (signInError) {
        toast({
          title: "Verificatie mislukt",
          description: "Huidig wachtwoord is incorrect",
          variant: "destructive"
        });
        return;
      }

      // Update email address
      const { error: updateError } = await supabase.auth.updateUser({
        email: formData.newEmail
      });

      if (updateError) {
        throw updateError;
      }

      // Log the email change attempt
      try {
        await supabase.rpc('log_notification', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_type: 'email_change_requested',
          p_title: 'Email adres wijziging aangevraagd',
          p_message: `Email wijziging van ${currentEmail} naar ${formData.newEmail}`,
          p_metadata: {
            old_email: currentEmail,
            new_email: formData.newEmail,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.warn('Failed to log email change:', logError);
      }

      toast({
        title: "Email wijziging aangevraagd",
        description: "Check je nieuwe email inbox voor de bevestigingslink"
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Email change error:', error);
      toast({
        title: "Fout bij email wijziging",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeInput(value)
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-500 flex items-center justify-center rounded-full">
          <Mail className="text-2xl text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-light">
            Email Adres Wijzigen
          </CardTitle>
          <p className="text-gray-500 mt-2 text-sm">
            Huidig adres: <span className="font-medium">{currentEmail}</span>
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Je ontvangt een bevestigingslink op je nieuwe email adres. 
            Je huidige email blijft actief tot je de wijziging bevestigt.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">Nieuw email adres</Label>
            <Input
              id="new-email"
              type="email"
              value={formData.newEmail}
              onChange={(e) => handleInputChange('newEmail', e.target.value)}
              placeholder="nieuw@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">Bevestig nieuw email adres</Label>
            <Input
              id="confirm-email"
              type="email"
              value={formData.confirmEmail}
              onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
              placeholder="nieuw@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-password">Huidig wachtwoord</Label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Je huidige wachtwoord"
              required
              autoComplete="current-password"
            />
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Email wijzigen...
              </div>
            ) : (
              "Email adres wijzigen"
            )}
          </Button>
        </form>

        {onBack && (
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailChangeForm;
