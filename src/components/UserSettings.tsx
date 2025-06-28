
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from './LoadingSpinner';
import { Mail, Shield, Bell, User, Lock } from 'lucide-react';
import { sanitizeInput, validateEmail } from '@/utils/sanitization';

const UserSettings = () => {
  const { user, profile, refreshUserData } = useAuth();
  const { preferences, loading, saving, savePreferences } = useUserPreferences();
  const { toast } = useToast();
  
  const [emailChange, setEmailChange] = useState({
    newEmail: '',
    password: '',
    loading: false
  });
  
  const [profileData, setProfileData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || ''
  });

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailChange.newEmail || !emailChange.password) {
      toast({
        title: "Validatie fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(emailChange.newEmail)) {
      toast({
        title: "Ongeldig email",
        description: "Voer een geldig email adres in",
        variant: "destructive"
      });
      return;
    }

    setEmailChange(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailChange.newEmail
      });

      if (error) throw error;

      toast({
        title: "Email wijziging aangevraagd",
        description: "Check je inbox voor de bevestigingslink"
      });

      setEmailChange({ newEmail: '', password: '', loading: false });
    } catch (error: any) {
      console.error('Email change error:', error);
      toast({
        title: "Fout bij email wijziging",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setEmailChange(prev => ({ ...prev, loading: false }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: sanitizeInput(profileData.first_name) || null,
          last_name: sanitizeInput(profileData.last_name) || null,
          phone: sanitizeInput(profileData.phone) || null
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshUserData();
      
      toast({
        title: "Profiel bijgewerkt",
        description: "Je profielgegevens zijn opgeslagen"
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Fout bij bijwerken profiel",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value
    };
    
    const success = await savePreferences(updatedPreferences);
    if (success) {
      toast({
        title: "Voorkeuren opgeslagen",
        description: "Je notificatie instellingen zijn bijgewerkt"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-light">Instellingen</h1>
        <p className="text-gray-600">Beheer je account en voorkeuren</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Persoonlijke Informatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Voornaam</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    first_name: sanitizeInput(e.target.value) 
                  }))}
                  placeholder="Je voornaam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Achternaam</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    last_name: sanitizeInput(e.target.value) 
                  }))}
                  placeholder="Je achternaam"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ 
                  ...prev, 
                  phone: sanitizeInput(e.target.value) 
                }))}
                placeholder="Je telefoonnummer"
              />
            </div>
            <Button type="submit">
              Profiel Opslaan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Instellingen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Huidig email adres</Label>
            <p className="text-gray-700 mt-1">{user?.email}</p>
          </div>
          
          <Separator />
          
          <form onSubmit={handleEmailChange} className="space-y-4">
            <h4 className="font-medium">Email adres wijzigen</h4>
            <Alert>
              <AlertDescription>
                Je ontvangt een bevestigingslink op je nieuwe email adres
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="new_email">Nieuw email adres</Label>
              <Input
                id="new_email"
                type="email"
                value={emailChange.newEmail}
                onChange={(e) => setEmailChange(prev => ({ 
                  ...prev, 
                  newEmail: sanitizeInput(e.target.value) 
                }))}
                placeholder="nieuw@email.com"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={emailChange.loading || !emailChange.newEmail}
            >
              {emailChange.loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Verwerken...
                </div>
              ) : (
                "Email Wijzigen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificatie Voorkeuren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Email notificaties</Label>
                <p className="text-sm text-gray-600">Ontvang algemene notificaties per email</p>
              </div>
              <Switch
                checked={preferences.email_notifications || false}
                onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Artikel updates</Label>
                <p className="text-sm text-gray-600">Krijg bericht bij nieuwe artikelen</p>
              </div>
              <Switch
                checked={preferences.article_updates || false}
                onCheckedChange={(checked) => handleNotificationChange('article_updates', checked)}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Veiligheids waarschuwingen</Label>
                <p className="text-sm text-gray-600">Belangrijke beveiligingsberichten</p>
              </div>
              <Switch
                checked={preferences.security_alerts !== false}
                onCheckedChange={(checked) => handleNotificationChange('security_alerts', checked)}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Wekelijkse digest</Label>
                <p className="text-sm text-gray-600">Samenvatting van nieuwe content</p>
              </div>
              <Switch
                checked={preferences.weekly_digest || false}
                onCheckedChange={(checked) => handleNotificationChange('weekly_digest', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Push notificaties</Label>
                <p className="text-sm text-gray-600">Browser notificaties (komt binnenkort)</p>
              </div>
              <Switch
                checked={false}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Beveiliging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Sessie timeout</Label>
              <p className="text-sm text-gray-600">Automatisch uitloggen na {preferences.session_timeout || 60} minuten inactiviteit</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Twee-factor authenticatie</Label>
              <p className="text-sm text-gray-600">Extra beveiliging voor je account (komt binnenkort)</p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>
          
          <Button variant="outline" className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Wachtwoord Wijzigen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
