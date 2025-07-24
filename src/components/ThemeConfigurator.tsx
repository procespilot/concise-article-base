import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Palette, RefreshCw, Save, Eye, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useThemeConfig, ThemeColors, ThemePreset } from '@/contexts/ThemeConfigContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  contrastCheck?: { background: string; label: string };
}

const ColorInput: React.FC<ColorInputProps> = ({ 
  label, 
  value, 
  onChange, 
  description, 
  contrastCheck 
}) => {
  const { validateContrast } = useThemeConfig();
  const [inputValue, setInputValue] = useState(value);
  
  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(newValue);
    }
  };

  const contrastValid = contrastCheck ? 
    validateContrast(value, contrastCheck.background) : true;

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <div 
          className="w-10 h-10 rounded border border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.addEventListener('change', (e) => {
              const target = e.target as HTMLInputElement;
              handleChange(target.value);
            });
            input.click();
          }}
        />
        <Input
          id={label}
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm"
        />
        {contrastCheck && (
          <div className="flex items-center">
            {contrastValid ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {contrastCheck && !contrastValid && (
        <p className="text-xs text-destructive">
          Poor contrast with {contrastCheck.label}
        </p>
      )}
    </div>
  );
};

const ThemePreview: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Live Preview</h3>
      
      {/* Button Examples */}
      <div className="space-y-2">
        <Label>Buttons</Label>
        <div className="flex space-x-2">
          <Button style={{ backgroundColor: theme.primary, color: theme.background }}>
            Primary
          </Button>
          <Button variant="outline" style={{ borderColor: theme.border, color: theme.foreground }}>
            Secondary
          </Button>
          <Button style={{ backgroundColor: theme.destructive, color: theme.background }}>
            Destructive
          </Button>
        </div>
      </div>

      {/* Card Example */}
      <div className="space-y-2">
        <Label>Card Components</Label>
        <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <CardHeader>
            <CardTitle style={{ color: theme.foreground }}>Sample Article</CardTitle>
            <CardDescription style={{ color: theme.muted }}>
              This is how your articles will look with the new theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Badge style={{ backgroundColor: theme.success, color: theme.background }}>
                Published
              </Badge>
              <Badge style={{ backgroundColor: theme.accent, color: theme.background }}>
                Featured
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Badges */}
      <div className="space-y-2">
        <Label>Status Badges</Label>
        <div className="flex flex-wrap gap-2">
          <Badge style={{ backgroundColor: theme.success, color: theme.background }}>
            Published
          </Badge>
          <Badge style={{ backgroundColor: theme.warning, color: theme.background }}>
            Draft
          </Badge>
          <Badge style={{ backgroundColor: theme.info, color: theme.background }}>
            Review
          </Badge>
          <Badge style={{ backgroundColor: theme.muted, color: theme.background }}>
            Archived
          </Badge>
        </div>
      </div>

      {/* Background Example */}
      <div className="space-y-2">
        <Label>Background & Text</Label>
        <div 
          className="p-4 rounded border"
          style={{ 
            backgroundColor: theme.background, 
            color: theme.foreground,
            borderColor: theme.border
          }}
        >
          <p>This shows how text will appear on your main background.</p>
          <p style={{ color: theme.muted }}>
            This is muted text for secondary information.
          </p>
        </div>
      </div>
    </div>
  );
};

const ThemeConfigurator: React.FC = () => {
  const { 
    currentTheme, 
    presets, 
    isLoading, 
    updateColor, 
    savePreset, 
    loadPreset, 
    resetToDefault 
  } = useThemeConfig();

  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const colorCategories = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primary' as keyof ThemeColors, label: 'Primary', description: 'Main brand color for buttons and links' },
        { key: 'secondary' as keyof ThemeColors, label: 'Secondary', description: 'Secondary backgrounds and muted elements' },
        { key: 'accent' as keyof ThemeColors, label: 'Accent', description: 'Accent color for highlights and CTAs' }
      ]
    },
    {
      title: 'Background & Text',
      colors: [
        { key: 'background' as keyof ThemeColors, label: 'Background', description: 'Main page background' },
        { key: 'foreground' as keyof ThemeColors, label: 'Foreground', description: 'Primary text color', contrastCheck: { background: currentTheme.background, label: 'background' } },
        { key: 'muted' as keyof ThemeColors, label: 'Muted Text', description: 'Secondary text and descriptions' },
        { key: 'card' as keyof ThemeColors, label: 'Card Background', description: 'Background for cards and panels' },
        { key: 'border' as keyof ThemeColors, label: 'Border', description: 'Border color for elements' }
      ]
    },
    {
      title: 'Status Colors',
      colors: [
        { key: 'success' as keyof ThemeColors, label: 'Success', description: 'Success states and published content' },
        { key: 'warning' as keyof ThemeColors, label: 'Warning', description: 'Warning states and draft content' },
        { key: 'destructive' as keyof ThemeColors, label: 'Destructive', description: 'Error states and delete actions' },
        { key: 'info' as keyof ThemeColors, label: 'Info', description: 'Information and neutral states' }
      ]
    }
  ];

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    
    await savePreset(presetName, presetDescription);
    setPresetName('');
    setPresetDescription('');
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Configuration</h2>
          <p className="text-muted-foreground">
            Customize the colors and appearance of your ClearBase platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefault}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Theme</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset-name">Theme Name</Label>
                  <Input
                    id="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="My Custom Theme"
                  />
                </div>
                <div>
                  <Label htmlFor="preset-description">Description (Optional)</Label>
                  <Input
                    id="preset-description"
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Describe your theme..."
                  />
                </div>
                <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Save Theme
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="presets">
            <Download className="h-4 w-4 mr-2" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {colorCategories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.colors.map((color) => (
                      <ColorInput
                        key={color.key}
                        label={color.label}
                        value={currentTheme[color.key]}
                        onChange={(value) => updateColor(color.key, value)}
                        description={color.description}
                        contrastCheck={color.contrastCheck}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:sticky lg:top-4">
              <ThemePreview theme={currentTheme} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{preset.name}</CardTitle>
                    {preset.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                  {preset.description && (
                    <CardDescription>{preset.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-1 mb-4">
                    {Object.values(preset.colors).slice(0, 6).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => loadPreset(preset)}
                  >
                    Apply Theme
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This preview shows how your theme will look across different components in ClearBase.
              Changes are applied in real-time as you modify colors.
            </AlertDescription>
          </Alert>
          
          <ThemePreview theme={currentTheme} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeConfigurator;