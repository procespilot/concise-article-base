import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Play, AlertCircle, Loader2 } from 'lucide-react';
import { Block, EmbedContent } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlockActions } from './BlockActions';
import { cn } from '@/lib/utils';

interface EmbedBlockProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  placeholder = "Plak een YouTube, Vimeo of andere URL..."
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedData, setEmbedData] = useState<EmbedContent | null>(null);

  // Initialize from block content
  useEffect(() => {
    if (block.content && typeof block.content === 'object') {
      setEmbedData(block.content as EmbedContent);
      setUrl(block.content.url || '');
    }
  }, [block.content]);

  const detectEmbedType = useCallback((url: string): EmbedContent['type'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    return 'generic';
  }, []);

  const extractVideoId = useCallback((url: string, type: EmbedContent['type']) => {
    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return youtubeMatch ? youtubeMatch[1] : null;
      
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : null;
      
      default:
        return null;
    }
  }, []);

  const generateEmbedUrl = useCallback((url: string, type: EmbedContent['type']) => {
    const videoId = extractVideoId(url, type);
    
    switch (type) {
      case 'youtube':
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      
      case 'vimeo':
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
      
      default:
        return url;
    }
  }, [extractVideoId]);

  const fetchEmbedData = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setEmbedData(null);
      onChange({ content: null });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const type = detectEmbedType(inputUrl);
      const embedUrl = generateEmbedUrl(inputUrl, type);
      
      if (!embedUrl) {
        throw new Error('Ongeldige URL voor dit type embed');
      }

      // For now, create basic embed data
      // In a real implementation, you might want to fetch metadata
      const newEmbedData: EmbedContent = {
        url: inputUrl,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Embed`,
        description: `Embedded content from ${new URL(inputUrl).hostname}`
      };

      setEmbedData(newEmbedData);
      onChange({ content: newEmbedData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden van embed');
      setEmbedData(null);
      onChange({ content: null });
    } finally {
      setIsLoading(false);
    }
  }, [detectEmbedType, generateEmbedUrl, onChange]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchEmbedData(url);
  }, [url, fetchEmbedData]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Auto-detect and load embed for known URLs
    if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be') || 
        newUrl.includes('vimeo.com') || newUrl.includes('twitter.com')) {
      const timeoutId = setTimeout(() => {
        fetchEmbedData(newUrl);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fetchEmbedData]);

  const renderEmbed = useCallback(() => {
    if (!embedData) return null;

    const embedUrl = generateEmbedUrl(embedData.url, embedData.type);
    if (!embedUrl) return null;

    switch (embedData.type) {
      case 'youtube':
      case 'vimeo':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={embedData.title}
            />
          </div>
        );
      
      case 'twitter':
        return (
          <div className="w-full max-w-lg mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <span className="font-medium">Twitter Post</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {embedData.description || 'Twitter content wordt geladen...'}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href={embedData.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Bekijk op Twitter
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{embedData.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {embedData.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new URL(embedData.url).hostname}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={embedData.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  }, [embedData, generateEmbedUrl]);

  return (
    <div className="embed-block group relative">
      {!embedData ? (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="outline" 
              disabled={!url.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Laden'
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-muted-foreground">
            Ondersteunt: YouTube, Vimeo, Twitter, en andere URLs
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {embedData.type.charAt(0).toUpperCase() + embedData.type.slice(1)} Embed
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmbedData(null);
                setUrl('');
                onChange({ content: null });
              }}
              className="text-xs"
            >
              URL wijzigen
            </Button>
          </div>
          
          {renderEmbed()}
          
          <div className="text-xs text-muted-foreground truncate">
            {embedData.url}
          </div>
        </div>
      )}

      <BlockActions
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
};