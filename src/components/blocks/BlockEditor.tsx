import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Block, BlockType } from '@/types/block';
import { BlockTypeSelector } from './BlockTypeSelector';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { CalloutBlock } from './CalloutBlock';
import { QuoteBlock } from './QuoteBlock';
import { CodeBlock } from './CodeBlock';
import { ChecklistBlock } from './ChecklistBlock';
import { DividerBlock } from './DividerBlock';
import { ImageBlock } from './ImageBlock';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
  placeholder = "Begin met typen of druk '/' voor opties..."
}) => {
  const [showTypeSelector, setShowTypeSelector] = useState<{ blockId: string; position: number } | null>(null);

  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addBlock = useCallback((type: BlockType, position: number, initialContent?: any) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: initialContent || (type === 'paragraph' ? '' : getDefaultContent(type)),
      meta: getDefaultMeta(type)
    };

    const newBlocks = [...blocks];
    newBlocks.splice(position, 0, newBlock);
    onChange(newBlocks);
    setShowTypeSelector(null);
  }, [blocks, onChange]);

  const updateBlock = useCallback((blockId: string, content: any, meta?: any) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, content, meta: meta ? { ...block.meta, ...meta } : block.meta }
        : block
    );
    onChange(newBlocks);
  }, [blocks, onChange]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onChange(newBlocks);
  }, [blocks, onChange]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = blocks[blockIndex];
    const duplicatedBlock: Block = {
      ...originalBlock,
      id: generateId()
    };

    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const newBlocks = Array.from(blocks);
    const [reorderedBlock] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedBlock);

    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string, blockIndex: number) => {
    if (e.key === '/') {
      e.preventDefault();
      setShowTypeSelector({ blockId, position: blockIndex + 1 });
    } else if (e.key === 'Enter' && !e.shiftKey) {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.type === 'paragraph' && !block.content.trim()) {
        e.preventDefault();
        addBlock('paragraph', blockIndex + 1);
      }
    }
  }, [blocks, addBlock]);

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      block,
      onChange: (content: any, meta?: any) => updateBlock(block.id, content, meta),
      onDelete: () => deleteBlock(block.id),
      onDuplicate: () => duplicateBlock(block.id),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id, index),
      placeholder: index === 0 ? placeholder : undefined
    };

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock {...commonProps} />;
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'callout':
        return <CalloutBlock {...commonProps} />;
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'checklist':
        return <ChecklistBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      default:
        return <ParagraphBlock {...commonProps} />;
    }
  };

  // Initialize with empty paragraph if no blocks
  if (blocks.length === 0) {
    const initialBlock: Block = {
      id: generateId(),
      type: 'paragraph',
      content: ''
    };
    onChange([initialBlock]);
    return null;
  }

  return (
    <div className="w-full max-w-[700px] mx-auto space-y-1">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "group relative",
                        snapshot.isDragging && "opacity-50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center justify-center w-6 h-6 mt-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {renderBlock(block, index)}
                        </div>
                      </div>

                      {/* Add block button */}
                      <div className="flex justify-center mt-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTypeSelector({ blockId: block.id, position: index + 1 })}
                          className="h-6 w-6 p-0 rounded-full border border-dashed border-muted-foreground/50 hover:border-primary"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Block Type Selector */}
      {showTypeSelector && (
        <BlockTypeSelector
          onSelect={(type) => addBlock(type, showTypeSelector.position)}
          onClose={() => setShowTypeSelector(null)}
        />
      )}
    </div>
  );
};

function getDefaultContent(type: BlockType): any {
  switch (type) {
    case 'heading':
      return '';
    case 'callout':
      return '';
    case 'quote':
      return '';
    case 'code':
      return '';
    case 'checklist':
      return [{ text: '', checked: false }];
    case 'divider':
      return null;
    case 'image':
      return { src: '', alt: '', caption: '' };
    case 'table':
      return { headers: ['Kolom 1', 'Kolom 2'], rows: [['', '']] };
    case 'embed':
      return { url: '', type: 'generic' };
    default:
      return '';
  }
}

function getDefaultMeta(type: BlockType): Block['meta'] {
  switch (type) {
    case 'heading':
      return { level: 2 };
    case 'callout':
      return { variant: 'info' };
    case 'code':
      return { language: 'javascript' };
    case 'image':
      return { alignment: 'center', size: 'medium' };
    case 'table':
      return { rows: 2, cols: 2 };
    case 'embed':
      return { url: '' };
    default:
      return {};
  }
}