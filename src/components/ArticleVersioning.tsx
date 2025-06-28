
import React, { useState, useEffect } from 'react';
import { History, Eye, RotateCcw, Calendar, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ArticleVersion {
  id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt?: string;
  created_at: string;
  created_by: string;
  author_name: string;
  change_summary?: string;
  is_current: boolean;
  word_count: number;
}

interface ArticleVersioningProps {
  articleId: string;
  currentVersion: ArticleVersion;
  onRestore?: (versionId: string) => void;
}

const ArticleVersioning = ({ articleId, currentVersion, onRestore }: ArticleVersioningProps) => {
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isManager } = useAuth();

  useEffect(() => {
    loadVersions();
  }, [articleId]);

  const loadVersions = async () => {
    // Mock data - in real implementation this would fetch from Supabase
    const mockVersions: ArticleVersion[] = [
      {
        id: '1',
        version_number: 3,
        title: currentVersion.title,
        content: currentVersion.content,
        excerpt: currentVersion.excerpt,
        created_at: new Date().toISOString(),
        created_by: currentVersion.created_by,
        author_name: currentVersion.author_name,
        change_summary: 'Updated conclusion and added new examples',
        is_current: true,
        word_count: currentVersion.content.split(' ').length
      },
      {
        id: '2',
        version_number: 2,
        title: currentVersion.title,
        content: currentVersion.content.slice(0, -200) + '...',
        excerpt: currentVersion.excerpt,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        created_by: currentVersion.created_by,
        author_name: currentVersion.author_name,
        change_summary: 'Fixed typos and improved formatting',
        is_current: false,
        word_count: currentVersion.content.split(' ').length - 50
      },
      {
        id: '3',
        version_number: 1,
        title: currentVersion.title + ' (Draft)',
        content: currentVersion.content.slice(0, -500) + '...',
        excerpt: 'Initial draft version',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        created_by: currentVersion.created_by,
        author_name: currentVersion.author_name,
        change_summary: 'Initial version',
        is_current: false,
        word_count: currentVersion.content.split(' ').length - 100
      }
    ];

    setVersions(mockVersions);
  };

  const handleRestore = async (version: ArticleVersion) => {
    if (!isManager) {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen rechten om versies te herstellen",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In real implementation, this would restore the version
      onRestore?.(version.id);
      
      toast({
        title: "Versie hersteld",
        description: `Versie ${version.version_number} is hersteld`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het herstellen van de versie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const VersionCard = ({ version }: { version: ArticleVersion }) => (
    <Card className={`mb-4 ${version.is_current ? 'border-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={version.is_current ? "default" : "secondary"}>
                v{version.version_number}
              </Badge>
              {version.is_current && (
                <Badge variant="outline">Huidige versie</Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Bekijken
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {version.title} - Versie {version.version_number}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: version.content }} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {!version.is_current && isManager && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRestore(version)}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Herstellen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(version.created_at).toLocaleString('nl-NL')}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {version.author_name}
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {version.word_count} woorden
          </div>
        </div>
        
        {version.change_summary && (
          <div className="bg-gray-50 p-3 rounded text-sm">
            <strong>Wijzigingen:</strong> {version.change_summary}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Versiegeschiedenis ({versions.length})
          </h3>
        </div>
      </div>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList>
          <TabsTrigger value="versions">Versies</TabsTrigger>
          <TabsTrigger value="compare">Vergelijken</TabsTrigger>
        </TabsList>
        
        <TabsContent value="versions" className="space-y-4">
          {versions.map(version => (
            <VersionCard key={version.id} version={version} />
          ))}
        </TabsContent>
        
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecteer twee versies om te vergelijken (komt binnenkort beschikbaar)
              </p>
              <div className="grid grid-cols-2 gap-4">
                {versions.slice(0, 2).map(version => (
                  <div key={version.id} className="p-3 border rounded">
                    <Badge className="mb-2">v{version.version_number}</Badge>
                    <p className="text-sm text-gray-600">
                      {new Date(version.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleVersioning;
