
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Globe,
  Save,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const Settings = () => {
  const { isManager, user } = useAuth();
  const { 
    preferences, 
    loading: preferencesLoading, 
    saving: preferencesSaving, 
    savePreferences 
  } = useUserPreferences();
  const { 
    settings: systemSettings, 
    loading: systemLoading, 
    saving: systemSaving, 
    saveSettings: saveSystemSettings,
    canEdit: canEditSystem 
  } = useSystemSettings();

  const [personalSettings, setPersonalSettings] = useState({
    displayName: "",
    email: "",
    notifications: true,
    emailUpdates: false,
    twoFactorAuth: false,
    sessionTimeout: 60
  });

  const [systemSettingsLocal, setSystemSettingsLocal] = useState({
    siteName: "ClearBase",
    siteDescription: "Knowledge Base Platform",
    allowRegistration: true,
    requireApproval: false,
    enableComments: true,
    enableRatings: true,
    primaryColor: "#3B82F6"
  });

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setPersonalSettings({
        displayName: preferences.display_name || user?.email?.split('@')[0] || "",
        email: user?.email || "",
        notifications: preferences.notifications,
        emailUpdates: preferences.email_updates,
        twoFactorAuth: preferences.two_factor_auth,
        sessionTimeout: preferences.session_timeout
      });
    }
  }, [preferences, user]);

  // Update local state when system settings load
  useEffect(() => {
    if (systemSettings) {
      setSystemSettingsLocal({
        siteName: systemSettings.site_name,
        siteDescription: systemSettings.site_description,
        allowRegistration: systemSettings.allow_registration,
        requireApproval: systemSettings.require_approval,
        enableComments: systemSettings.enable_comments,
        enableRatings: systemSettings.enable_ratings,
        primaryColor: systemSettings.primary_color
      });
    }
  }, [systemSettings]);

  const handleSavePersonal = async () => {
    const success = await savePreferences({
      display_name: personalSettings.displayName,
      notifications: personalSettings.notifications,
      email_updates: personalSettings.emailUpdates,
      two_factor_auth: personalSettings.twoFactorAuth,
      session_timeout: personalSettings.sessionTimeout
    });

    if (success) {
      console.log("Personal settings saved successfully");
    }
  };

  const handleSaveSystem = async () => {
    const success = await saveSystemSettings({
      site_name: systemSettingsLocal.siteName,
      site_description: systemSettingsLocal.siteDescription,
      allow_registration: systemSettingsLocal.allowRegistration,
      require_approval: systemSettingsLocal.requireApproval,
      enable_comments: systemSettingsLocal.enableComments,
      enable_ratings: systemSettingsLocal.enableRatings,
      primary_color: systemSettingsLocal.primaryColor
    });

    if (success) {
      console.log("System settings saved successfully");
    }
  };

  const updatePersonalSetting = (key: string, value: any) => {
    setPersonalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettingsLocal(prev => ({ ...prev, [key]: value }));
  };

  const isLoading = preferencesLoading || systemLoading;
  const isSaving = preferencesSaving || systemSaving;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-gray-600 mt-1">
          {isManager 
            ? "Configureer je ClearBase omgeving" 
            : "Beheer je persoonlijke instellingen"
          }
        </p>
      </div>

      {/* Personal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Persoonlijke instellingen</span>
          </CardTitle>
          <CardDescription>
            Beheer je accountgegevens en voorkeuren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Weergavenaam</Label>
              <Input
                id="displayName"
                value={personalSettings.displayName}
                onChange={(e) => updatePersonalSetting("displayName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={personalSettings.email}
                onChange={(e) => updatePersonalSetting("email", e.target.value)}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">E-mailadres kan niet worden gewijzigd</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notificaties</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Push notificaties</Label>
                  <p className="text-sm text-gray-500">Ontvang meldingen in de browser</p>
                </div>
                <Switch
                  id="notifications"
                  checked={personalSettings.notifications}
                  onCheckedChange={(checked) => updatePersonalSetting("notifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailUpdates">E-mail updates</Label>
                  <p className="text-sm text-gray-500">Ontvang updates via e-mail</p>
                </div>
                <Switch
                  id="emailUpdates"
                  checked={personalSettings.emailUpdates}
                  onCheckedChange={(checked) => updatePersonalSetting("emailUpdates", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button 
              onClick={handleSavePersonal} 
              disabled={isSaving}
              className="bg-clearbase-600 hover:bg-clearbase-700"
            >
              {preferencesSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Persoonlijke instellingen opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Beveiliging</span>
          </CardTitle>
          <CardDescription>
            Beveilig je account met extra opties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactorAuth">Twee-factor authenticatie</Label>
              <p className="text-sm text-gray-500">Extra beveiligingslaag voor je account</p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={personalSettings.twoFactorAuth}
              onCheckedChange={(checked) => updatePersonalSetting("twoFactorAuth", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Sessie timeout (minuten)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={personalSettings.sessionTimeout}
              onChange={(e) => updatePersonalSetting("sessionTimeout", parseInt(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">Automatisch uitloggen na inactiviteit</p>
          </div>
        </CardContent>
      </Card>

      {/* System Settings (Manager Only) */}
      {isManager && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Systeem instellingen</span>
              </CardTitle>
              <CardDescription>
                Algemene configuratie van je knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site naam</Label>
                  <Input
                    id="siteName"
                    value={systemSettingsLocal.siteName}
                    onChange={(e) => updateSystemSetting("siteName", e.target.value)}
                    disabled={!canEditSystem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site beschrijving</Label>
                  <Input
                    id="siteDescription"
                    value={systemSettingsLocal.siteDescription}
                    onChange={(e) => updateSystemSetting("siteDescription", e.target.value)}
                    disabled={!canEditSystem}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Gebruikerstoegang</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowRegistration">Registratie toestaan</Label>
                      <p className="text-sm text-gray-500">Nieuwe gebruikers kunnen zich aanmelden</p>
                    </div>
                    <Switch
                      id="allowRegistration"
                      checked={systemSettingsLocal.allowRegistration}
                      onCheckedChange={(checked) => updateSystemSetting("allowRegistration", checked)}
                      disabled={!canEditSystem}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireApproval">Goedkeuring vereist</Label>
                      <p className="text-sm text-gray-500">Nieuwe accounts moeten goedgekeurd worden</p>
                    </div>
                    <Switch
                      id="requireApproval"
                      checked={systemSettingsLocal.requireApproval}
                      onCheckedChange={(checked) => updateSystemSetting("requireApproval", checked)}
                      disabled={!canEditSystem}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Content opties</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableComments">Reacties inschakelen</Label>
                      <p className="text-sm text-gray-500">Gebruikers kunnen reageren op artikelen</p>
                    </div>
                    <Switch
                      id="enableComments"
                      checked={systemSettingsLocal.enableComments}
                      onCheckedChange={(checked) => updateSystemSetting("enableComments", checked)}
                      disabled={!canEditSystem}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRatings">Beoordelingen inschakelen</Label>
                      <p className="text-sm text-gray-500">Gebruikers kunnen artikelen beoordelen</p>
                    </div>
                    <Switch
                      id="enableRatings"
                      checked={systemSettingsLocal.enableRatings}
                      onCheckedChange={(checked) => updateSystemSetting("enableRatings", checked)}
                      disabled={!canEditSystem}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSystem} 
                  disabled={!canEditSystem || isSaving}
                  className="bg-clearbase-600 hover:bg-clearbase-700"
                >
                  {systemSaving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Systeeminstellingen opslaan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Uiterlijk</span>
              </CardTitle>
              <CardDescription>
                Pas het uiterlijk van je knowledge base aan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primaire kleur</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={systemSettingsLocal.primaryColor}
                    onChange={(e) => updateSystemSetting("primaryColor", e.target.value)}
                    className="w-20 h-10"
                    disabled={!canEditSystem}
                  />
                  <Input
                    value={systemSettingsLocal.primaryColor}
                    onChange={(e) => updateSystemSetting("primaryColor", e.target.value)}
                    className="flex-1"
                    disabled={!canEditSystem}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Settings;
