
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Key, Monitor, Settings } from "lucide-react";
import ApiKeyGenerator from './ApiKeyGenerator';

const DevTools = () => {
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Onbekend</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Development Tools</h1>
          <p className="text-gray-600">API Gateway beheer en development hulpmiddelen</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button onClick={checkApiStatus} variant="outline" size="sm">
            <Monitor className="w-4 h-4 mr-2" />
            Check Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>    
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <ApiKeyGenerator />
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Overzicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Artikelen API
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/api/articles</code>
                      <span className="text-gray-500">- Artikelen lijst met filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/api/articles/:id</code>
                      <span className="text-gray-500">- Enkel artikel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code>/api/articles</code>
                      <span className="text-gray-500">- Nieuw artikel (manager+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">PUT</Badge>
                      <code>/api/articles/:id</code>
                      <span className="text-gray-500">- Update artikel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">PATCH</Badge>
                      <code>/api/articles/:id/publish</code>
                      <span className="text-gray-500">- Publiceer artikel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code>/api/articles/:id/view</code>
                      <span className="text-gray-500">- Verhoog views</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Categorieën API</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/api/categories</code>
                      <span className="text-gray-500">- Alle categorieën</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code>/api/categories</code>
                      <span className="text-gray-500">- Nieuwe categorie (manager+)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Gebruikers API (Admin only)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/api/users</code>
                      <span className="text-gray-500">- Gebruikerslijst</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code>/api/users</code>
                      <span className="text-gray-500">- Gebruiker uitnodigen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">PATCH</Badge>
                      <code>/api/users/:id/activate</code>
                      <span className="text-gray-500">- Activeer/deactiveer</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">System Endpoints</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/health</code>
                      <span className="text-gray-500">- Basic health check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/health/detailed</code>
                      <span className="text-gray-500">- Detailed health met dependencies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code>/docs</code>
                      <span className="text-gray-500">- Swagger API documentatie</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema Overzicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Hoofdtabellen</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 border rounded">
                      <strong>articles</strong>
                      <div className="mt-1 text-gray-600">
                        id, title, content, excerpt, status, category_id, author_id, views, created_at
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <strong>categories</strong>
                      <div className="mt-1 text-gray-600">
                        id, name, description, created_at
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <strong>profiles</strong>
                      <div className="mt-1 text-gray-600">
                        id, email, first_name, last_name, phone, is_active
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <strong>user_roles</strong>
                      <div className="mt-1 text-gray-600">
                        id, user_id, role (user/manager/admin)
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">RPC Functies</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">get_users_with_roles()</code>
                      <span className="text-gray-600">- Gebruikers met hun rollen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">create_user_with_role()</code>
                      <span className="text-gray-600">- Nieuwe gebruiker aanmaken</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">activate_user()</code>
                      <span className="text-gray-600">- Gebruiker activeren</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">deactivate_user()</code>
                      <span className="text-gray-600">- Gebruiker deactiveren</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Development Configuratie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Environment Variables</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>NODE_ENV=development</div>
                    <div>PORT=3001</div>
                    <div>SUPABASE_URL=https://lboqahwardtgidzcgxjl.supabase.co</div>
                    <div>API_KEYS=dev-manager-key-2024,dev-admin-key-2024</div>
                    <div>REDIS_URL=redis://localhost:6379</div>
                    <div>CORS_ORIGINS=http://localhost:3000,http://localhost:5173</div>
                    <div>LOG_LEVEL=debug</div>
                    <div>RATE_LIMIT_MAX=1000  # Verhoogd voor development</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quick Start Commands</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-100 p-2 rounded font-mono">
                      cd api && npm install && npm run dev
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono">
                      docker-compose up -d  # Voor Redis
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono">
                      npm run test  # Run tests
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Development URLs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">API</Badge>
                      <a href="http://localhost:3001" target="_blank" className="text-blue-600 hover:underline">
                        http://localhost:3001
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Docs</Badge>
                      <a href="http://localhost:3001/docs" target="_blank" className="text-blue-600 hover:underline">
                        http://localhost:3001/docs
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Health</Badge>
                      <a href="http://localhost:3001/health" target="_blank" className="text-blue-600 hover:underline">
                        http://localhost:3001/health
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DevTools;
