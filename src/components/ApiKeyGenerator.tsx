
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  role: string;
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

const ApiKeyGenerator = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const generateApiKey = () => {
    const prefix = 'cbapi';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Naam vereist",
        description: "Geef een naam op voor de API key",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name: newKeyName.trim(),
        key: generateApiKey(),
        role: 'manager',
        created_at: new Date().toISOString(),
        is_active: true
      };

      // In een echte implementatie zou je dit opslaan in de database
      // Voor nu bewaren we het in de state
      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName('');
      
      toast({
        title: "API Key gegenereerd",
        description: `Nieuwe API key "${newKey.name}" is aangemaakt`,
      });
    } catch (error) {
      toast({
        title: "Fout bij genereren",
        description: "Er is een fout opgetreden bij het genereren van de API key",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Gekopieerd",
        description: `API key "${name}" is gekopieerd naar klembord`,
      });
    } catch (error) {
      toast({
        title: "Fout bij kopiëren",
        description: "Kon de API key niet kopiëren",
        variant: "destructive"
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const deactivateKey = (keyId: string) => {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === keyId 
          ? { ...key, is_active: false }
          : key
      )
    );
    
    toast({
      title: "API Key gedeactiveerd",
      description: "De API key is succesvol gedeactiveerd",
    });
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length < 12) return apiKey;
    const start = apiKey.substring(0, 8);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}${'*'.repeat(apiKey.length - 12)}${end}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Generator (Manager)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">Naam voor API Key</Label>
              <Input
                id="keyName"
                placeholder="bijv. 'Mobile App Integration'"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateKey()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateKey}
                disabled={isGenerating || !newKeyName.trim()}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Genereer Key
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Manager API Toegang</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Artikelen aanmaken, bewerken en publiceren</li>
              <li>• Categorieën beheren</li>
              <li>• Gebruikers uitnodigen (niet admin rechten)</li>
              <li>• Rate limit: 100 requests/minuut</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {apiKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gegenereerde API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className={`border rounded-lg p-4 ${
                    !apiKey.is_active ? 'opacity-50 bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                        {apiKey.is_active ? "Actief" : "Inactief"}
                      </Badge>
                      <Badge variant="outline">{apiKey.role}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.name)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      {apiKey.is_active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deactivateKey(apiKey.id)}
                        >
                          Deactiveren
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">API Key</Label>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded border">
                        {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Aangemaakt: {new Date(apiKey.created_at).toLocaleDateString('nl-NL')}</span>
                      {apiKey.last_used && (
                        <span>Laatst gebruikt: {new Date(apiKey.last_used).toLocaleDateString('nl-NL')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gebruik Instructies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">cURL Voorbeeld</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="mb-2"># Artikelen ophalen</div>
              <div>curl -H "x-api-key: jouw-api-key" \</div>
              <div className="ml-5">http://localhost:3001/api/articles</div>
              
              <div className="mt-4 mb-2"># Artikel aanmaken</div>
              <div>curl -X POST \</div>
              <div className="ml-5">-H "x-api-key: jouw-api-key" \</div>
              <div className="ml-5">-H "Content-Type: application/json" \</div>
              <div className="ml-5">-d '{`{"title":"Test","content":"Inhoud"}`}' \</div>
              <div className="ml-5">http://localhost:3001/api/articles</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">JavaScript Voorbeeld</h4>
            <div className="bg-gray-900 text-blue-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div>{`const response = await fetch('http://localhost:3001/api/articles', {`}</div>
              <div className="ml-2">{`headers: {`}</div>
              <div className="ml-4">{`'x-api-key': 'jouw-api-key',`}</div>
              <div className="ml-4">{`'Content-Type': 'application/json'`}</div>
              <div className="ml-2">{`}`}</div>
              <div>{`});`}</div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Beveiligingsnotitie</h4>
            <p className="text-sm text-yellow-700">
              Bewaar API keys veilig en deel ze nooit publiekelijk. 
              Voor production gebruik echte secret management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyGenerator;
