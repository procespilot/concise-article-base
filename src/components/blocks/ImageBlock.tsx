import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image, Link, Trash2 } from 'lucide-react';
import { BlockActions } from './BlockActions';
import { Block, ImageContent } from '@/types/block';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  placeholder?: string;
}


export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  onFocus
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  const content: ImageContent = block.content || { src: '', alt: '', caption: '' };
  const alignment = block.meta?.alignment || 'center';
  const size = block.meta?.size || 'medium';

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Create object URL for preview (in a real app, upload to storage)
      const src = URL.createObjectURL(file);
      onChange({
        content: {
          ...content,
          src,
          alt: file.name
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange({
        content: {
          ...content,
          src: urlInput.trim(),
          alt: 'Uploaded image'
        }
      });
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const updateCaption = (caption: string) => {
    onChange({ 
      content: { ...content, caption }
    });
  };

  const updateAlt = (alt: string) => {
    onChange({ 
      content: { ...content, alt }
    });
  };

  const updateAlignment = (alignment: string) => {
    onChange({ 
      meta: { ...block.meta, alignment: alignment as 'left' | 'center' | 'right' }
    });
  };

  const updateSize = (size: string) => {
    onChange({ 
      meta: { ...block.meta, size: size as 'small' | 'medium' | 'large' | 'full' }
    });
  };

  const getImageClasses = () => {
    const sizeClasses = {
      small: 'max-w-xs',
      medium: 'max-w-md',
      large: 'max-w-2xl',
      full: 'w-full'
    };

    const alignmentClasses = {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto'
    };

    return cn(
      'rounded-lg border',
      sizeClasses[size as keyof typeof sizeClasses],
      alignmentClasses[alignment as keyof typeof alignmentClasses]
    );
  };

  if (!content.src) {
    return (
      <div className="group relative py-4">
        <div className="flex justify-end mb-2">
          <BlockActions
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        <div
          className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Afbeelding toevoegen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sleep een afbeelding hierheen of gebruik een van de opties
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <Link className="w-4 h-4 mr-2" />
                URL
              </Button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 mt-4 max-w-md mx-auto">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
                <Button size="sm" onClick={handleUrlSubmit}>
                  Toevoegen
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Select value={alignment} onValueChange={updateAlignment}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Links</SelectItem>
              <SelectItem value="center">Midden</SelectItem>
              <SelectItem value="right">Rechts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={size} onValueChange={updateSize}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Klein</SelectItem>
              <SelectItem value="medium">Gemiddeld</SelectItem>
              <SelectItem value="large">Groot</SelectItem>
              <SelectItem value="full">Volledig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BlockActions
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className={cn("flex", alignment === 'center' && 'justify-center', alignment === 'right' && 'justify-end')}>
        <div className="space-y-2">
          <img
            src={content.src}
            alt={content.alt}
            className={getImageClasses()}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFmYmVlbGRpbmcgbmlldCBiZXNjaGlrYmFhcjwvdGV4dD48L3N2Zz4=';
            }}
          />
          
          <div className="space-y-2">
            <Input
              placeholder="Alt tekst voor toegankelijkheid"
              value={content.alt}
              onChange={(e) => updateAlt(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Bijschrift (optioneel)"
              value={content.caption || ''}
              onChange={(e) => updateCaption(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};