import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Type, 
  ExpandIcon, 
  CheckCircle,
  Copy,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantProps {
  content: string;
  onInsert: (text: string) => void;
  onClose: () => void;
}

const aiActions = [
  {
    id: 'summary',
    label: 'Samenvatting',
    description: 'Maak een korte samenvatting',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'rewrite',
    label: 'Herschrijven',
    description: 'Verbeter de tekst',
    icon: RefreshCw,
    color: 'bg-green-500'
  },
  {
    id: 'titles',
    label: 'Titelvoorstellen',
    description: 'Genereer alternatieve titels',
    icon: Type,
    color: 'bg-purple-500'
  },
  {
    id: 'expand',
    label: 'Uitbreiden',
    description: 'Voeg meer details toe',
    icon: ExpandIcon,
    color: 'bg-orange-500'
  },
  {
    id: 'improve',
    label: 'Verbeteren',
    description: 'Corrigeer grammatica en stijl',
    icon: CheckCircle,
    color: 'bg-pink-500'
  }
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  content,
  onInsert,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const generateContent = async (type: string, prompt?: string) => {
    setIsGenerating(true);
    setSelectedAction(type);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          type,
          content,
          prompt: prompt || customPrompt
        }
      });

      if (error) throw error;

      setGeneratedText(data.generatedText);
      toast({
        title: "AI inhoud gegenereerd",
        description: "De AI heeft nieuwe inhoud voor je gemaakt!"
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Fout bij genereren",
        description: "Er ging iets mis bij het genereren van inhoud",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Gekopieerd",
        description: "Tekst is gekopieerd naar het klembord"
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const insertText = () => {
    onInsert(generatedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <CardTitle>AI Schrijfassistent</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto">
          {/* Current Content Preview */}
          <div>
            <h3 className="font-medium mb-2">Huidige tekst</h3>
            <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
              {content.slice(0, 300)}
              {content.length > 300 && '...'}
            </div>
          </div>

          {/* AI Actions */}
          <div>
            <h3 className="font-medium mb-3">Wat wil je doen?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-3 justify-start"
                    onClick={() => generateContent(action.id)}
                    disabled={isGenerating}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <h3 className="font-medium mb-2">Of geef een eigen opdracht</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Bijvoorbeeld: 'Maak deze tekst formeler' of 'Voeg meer voorbeelden toe'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
              <Button
                onClick={() => generateContent('custom')}
                disabled={isGenerating || !customPrompt.trim()}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Genereren...' : 'Genereer'}
              </Button>
            </div>
          </div>

          {/* Generated Content */}
          {generatedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Gegenereerde inhoud</h3>
                {selectedAction && (
                  <Badge variant="secondary">
                    {aiActions.find(a => a.id === selectedAction)?.label || 'Custom'}
                  </Badge>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {generatedText}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={insertText}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Invoegen
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generatedText)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Kopiëren
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateContent(selectedAction || 'custom')}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Opnieuw
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">AI genereert inhoud...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};