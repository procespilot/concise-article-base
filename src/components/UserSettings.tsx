
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Bell, Shield, Palette, ArrowLeft, Home } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import EmailChangeForm from '@/components/EmailChangeForm';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/sanitization';

const UserSettings = () => {
  const { user, profile, loading: authLoading, updateProfile, isManager, isAdmin } = useAuth();
  const { preferences, savePreferences, loading: prefsLoading } = useUserPreferences();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || ''
  });
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const sanitizedData = {
        first_name: sanitizeInput(profileForm.first_name),
        last_name: sanitizeInput(profileForm.last_name),
        phone: sanitizeInput(profileForm.phone)
      };

      const success = await updateProfile(sanitizedData);
      if (success) {
        toast({
          title: "Profiel bijgewerkt",
          description: "Je profielgegevens zijn succesvol opgeslagen"
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van je profiel",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    try {
      await savePreferences({ [key]: value });
      toast({
        title: "Voorkeuren bijgewerkt",
        description: "Je voorkeuren zijn opgeslagen"
      });
    } catch (error) {
      console.error('Preference update error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van je voorkeuren",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showEmailChange) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowEmailChange(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar instellingen
          </Button>
        </div>
        <EmailChangeForm 
          currentEmail={user?.email || ''} 
          onBack={() => setShowEmailChange(false)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gebruikersinstellingen</h1>
            <p className="text-gray-600">Beheer je profiel en voorkeuren</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Terug naar hoofdpagina
          </Link>
        </Button>
      </div>

      {(isManager || isAdmin) && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            Je hebt {isAdmin ? 'beheerder' : 'manager'} toegang tot het systeem.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profielinformatie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Voornaam</Label>
                <Input
                  id="first_name"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm(prev => ({
                    ...prev,
                    first_name: sanitizeInput(e.target.value)
                  }))}
                  placeholder="Je voornaam"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Achternaam</Label>
                <Input
                  id="last_name"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm(prev => ({
                    ...prev,
                    last_name: sanitizeInput(e.target.value)
                  }))}
                  placeholder="Je achternaam"
                  maxLength={50}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({
                  ...prev,
                  phone: sanitizeInput(e.target.value)
                }))}
                placeholder="Je telefoonnummer"
                maxLength={20}
              />
            </div>

            <Button 
              type="submit" 
              disabled={profileLoading}
              className="w-full md:w-auto"
            >
              {profileLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Bijwerken...
                </div>
              ) : (
                "Profiel bijwerken"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Email instellingen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Huidig email adres</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowEmailChange(true)}
            >
              Email wijzigen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificatie voorkeuren</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {prefsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications" className="text-base font-medium">
                    Email notificaties
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ontvang updates via email
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={preferences?.email_notifications ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_notifications" className="text-base font-medium">
                    Push notificaties
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ontvang push notificaties in je browser
                  </p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={preferences?.push_notifications ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="article_updates" className="text-base font-medium">
                    Artikel updates
                  </Label>
                  <p className="text-sm text-gray-600">
                    Krijg notificaties bij nieuwe artikelen
                  </p>
                </div>
                <Switch
                  id="article_updates"
                  checked={preferences?.article_updates ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('article_updates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly_digest" className="text-base font-medium">
                    Wekelijkse samenvatting
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ontvang een wekelijks overzicht
                  </p>
                </div>
                <Switch
                  id="weekly_digest"
                  checked={preferences?.weekly_digest ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('weekly_digest', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="security_alerts" className="text-base font-medium">
                    Beveiligingswaarschuwingen
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ontvang belangrijke beveiligingsupdates
                  </p>
                </div>
                <Switch
                  id="security_alerts"
                  checked={preferences?.security_alerts ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('security_alerts', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
