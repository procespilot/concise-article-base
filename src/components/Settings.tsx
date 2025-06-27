
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Globe,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { isManager, user } = useAuth();
  const [settings, setSettings] = useState({
    // Personal Settings
    displayName: user?.name || "",
    email: user?.email || "",
    notifications: true,
    emailUpdates: false,
    
    // System Settings (Manager only)
    siteName: "ClearBase",
    siteDescription: "Knowledge Base Platform",
    allowRegistration: true,
    requireApproval: false,
    enableComments: true,
    enableRatings: true,
    
    // Appearance
    theme: "light",
    primaryColor: "#3B82F6",
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 60
  });

  const handleSave = () => {
    console.log("Settings saved:", settings);
    // In real app, this would save to backend
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
                value={settings.displayName}
                onChange={(e) => updateSetting("displayName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting("email", e.target.value)}
              />
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
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting("notifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailUpdates">E-mail updates</Label>
                  <p className="text-sm text-gray-500">Ontvang updates via e-mail</p>
                </div>
                <Switch
                  id="emailUpdates"
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked) => updateSetting("emailUpdates", checked)}
                />
              </div>
            </div>
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
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => updateSetting("twoFactorAuth", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Sessie timeout (minuten)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
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
                    value={settings.siteName}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site beschrijving</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting("siteDescription", e.target.value)}
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
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) => updateSetting("allowRegistration", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireApproval">Goedkeuring vereist</Label>
                      <p className="text-sm text-gray-500">Nieuwe accounts moeten goedgekeurd worden</p>
                    </div>
                    <Switch
                      id="requireApproval"
                      checked={settings.requireApproval}
                      onCheckedChange={(checked) => updateSetting("requireApproval", checked)}
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
                      checked={settings.enableComments}
                      onCheckedChange={(checked) => updateSetting("enableComments", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRatings">Beoordelingen inschakelen</Label>
                      <p className="text-sm text-gray-500">Gebruikers kunnen artikelen beoordelen</p>
                    </div>
                    <Switch
                      id="enableRatings"
                      checked={settings.enableRatings}
                      onCheckedChange={(checked) => updateSetting("enableRatings", checked)}
                    />
                  </div>
                </div>
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
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-clearbase-600 hover:bg-clearbase-700">
          <Save className="w-4 h-4 mr-2" />
          Instellingen opslaan
        </Button>
      </div>
    </div>
  );
};

export default Settings;
