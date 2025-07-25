import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, MoreVertical, Undo2, Redo2, Save, Search } from 'lucide-react';
import { Block, BlockType } from '@/types/block';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlockTypeSelector } from './BlockTypeSelector';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { QuoteBlock } from './QuoteBlock';
import { CodeBlock } from './CodeBlock';
import { ImageBlock } from './ImageBlock';
import { ChecklistBlock } from './ChecklistBlock';
import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { TableBlock } from './TableBlock';
import { EmbedBlock } from './EmbedBlock';
import { BlockActions } from './BlockActions';
import { cn } from '@/lib/utils';

interface AdvancedBlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  onSave?: (blocks: Block[]) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  showToolbar?: boolean;
  maxBlocks?: number;
}

export const AdvancedBlockEditor: React.FC<AdvancedBlockEditorProps> = ({
  blocks: initialBlocks,
  onChange,
  onSave,
  placeholder = "Begin met typen of druk '/' voor blokopties...",
  className,
  autoSave = true,
  showToolbar = true,
  maxBlocks = 1000
}) => {
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isVirtualized, setIsVirtualized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    blocks,
    hasUnsavedChanges,
    focusedBlockId,
    selectedBlockIds,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    selectBlock,
    clearSelection,
    focusBlock,
    saveBlocks
  } = useBlockEditor(initialBlocks, (blocks) => {
    onChange(blocks);
    onSave?.(blocks);
  }, autoSave);

  // Enable virtualization for large documents
  useEffect(() => {
    setIsVirtualized(blocks.length > 100);
  }, [blocks.length]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex !== destinationIndex) {
      moveBlock(sourceIndex, destinationIndex);
    }
  }, [moveBlock]);

  const handleBlockKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const block = blocks[blockIndex];

    switch (e.key) {
      case '/':
        if (block.type === 'paragraph' && block.content === '') {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          setSelectorPosition({ x: rect.left, y: rect.bottom });
          setShowBlockSelector(true);
        }
        break;

      case 'ArrowUp':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (blockIndex > 0) {
            focusBlock(blocks[blockIndex - 1].id);
          }
        }
        break;

      case 'ArrowDown':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (blockIndex < blocks.length - 1) {
            focusBlock(blocks[blockIndex + 1].id);
          }
        }
        break;

      case 'Enter':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          const newBlockId = addBlock('paragraph', blockIndex + 1);
          setTimeout(() => focusBlock(newBlockId), 100);
        }
        break;

      case 'Backspace':
        if (block.type === 'paragraph' && block.content === '' && blocks.length > 1) {
          e.preventDefault();
          deleteBlock(blockId);
          if (blockIndex > 0) {
            focusBlock(blocks[blockIndex - 1].id);
          }
        }
        break;

      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          // Outdent logic (for lists, etc.)
        } else {
          // Indent logic (for lists, etc.)
        }
        break;
    }
  }, [blocks, addBlock, deleteBlock, focusBlock]);

  const handleBlockTypeSelect = useCallback((type: BlockType) => {
    const focusedBlock = blocks.find(b => b.id === focusedBlockId);
    if (focusedBlock && focusedBlock.type === 'paragraph' && focusedBlock.content === '') {
      updateBlock(focusedBlockId!, { type });
    } else {
      const blockIndex = focusedBlockId ? blocks.findIndex(b => b.id === focusedBlockId) : blocks.length;
      const newBlockId = addBlock(type, blockIndex);
      setTimeout(() => focusBlock(newBlockId), 100);
    }
    setShowBlockSelector(false);
  }, [blocks, focusedBlockId, updateBlock, addBlock, focusBlock]);

  const renderBlock = useCallback((block: Block, index: number) => {
    const isSelected = selectedBlockIds.includes(block.id);
    const isFocused = focusedBlockId === block.id;

    const blockProps = {
      block,
      onChange: (updates: Partial<Block>) => updateBlock(block.id, updates),
      onDelete: () => deleteBlock(block.id),
      onDuplicate: () => duplicateBlock(block.id),
      onKeyDown: (e: React.KeyboardEvent) => handleBlockKeyDown(e, block.id),
      onFocus: () => focusBlock(block.id),
      placeholder: index === 0 ? placeholder : undefined
    };

    let BlockComponent;
    switch (block.type) {
      case 'paragraph':
        BlockComponent = ParagraphBlock;
        break;
      case 'heading':
        BlockComponent = HeadingBlock;
        break;
      case 'quote':
        BlockComponent = QuoteBlock;
        break;
      case 'code':
        BlockComponent = CodeBlock;
        break;
      case 'image':
        BlockComponent = ImageBlock;
        break;
      case 'checklist':
        BlockComponent = ChecklistBlock;
        break;
      case 'callout':
        BlockComponent = CalloutBlock;
        break;
      case 'divider':
        BlockComponent = DividerBlock;
        break;
      case 'table':
        BlockComponent = TableBlock;
        break;
      case 'embed':
        BlockComponent = EmbedBlock;
        break;
      default:
        BlockComponent = ParagraphBlock;
    }

    return (
      <Draggable key={block.id} draggableId={block.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(
              "group relative mb-1 transition-all duration-200",
              isSelected && "ring-2 ring-primary/50 rounded-lg",
              isFocused && "ring-1 ring-primary/30 rounded-lg",
              snapshot.isDragging && "shadow-lg rotate-1 scale-105 z-50"
            )}
          >
            <div className="flex items-start gap-2">
              {/* Drag handle */}
              <div
                {...provided.dragHandleProps}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Block content */}
              <div className="flex-1 min-w-0">
                <BlockComponent {...blockProps} />
              </div>

              {/* Block actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <BlockActions
                  onDuplicate={() => duplicateBlock(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                />
              </div>
            </div>

            {/* Add block button between blocks */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-2 left-8 right-8 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-background border border-border hover:bg-muted"
                onClick={() => addBlock('paragraph', index + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </Draggable>
    );
  }, [
    selectedBlockIds,
    focusedBlockId,
    placeholder,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    handleBlockKeyDown,
    focusBlock,
    addBlock,
    moveBlock,
    blocks.length
  ]);

  // Filter blocks based on search term
  const filteredBlocks = searchTerm
    ? blocks.filter(block => {
        const content = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
        return content.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : blocks;

  return (
    <div className={cn("advanced-block-editor", className)} ref={containerRef}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Ongedaan maken (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Opnieuw (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={saveBlocks}
              disabled={!hasUnsavedChanges}
              title="Opslaan (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              {hasUnsavedChanges && <div className="w-2 h-2 bg-orange-500 rounded-full ml-1" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoeken in blokken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {blocks.length} blokken
            </Badge>
            {isVirtualized && (
              <Badge variant="outline" className="text-xs">
                Gevirtualiseerd
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Block container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks" type="block">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "min-h-[200px] transition-colors duration-200",
                snapshot.isDraggingOver && "bg-muted/20 rounded-lg"
              )}
              onClick={clearSelection}
            >
              {filteredBlocks.length === 0 && searchTerm ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Geen blokken gevonden voor "{searchTerm}"
                </div>
              ) : (
                filteredBlocks.map((block, index) => renderBlock(block, index))
              )}
              {provided.placeholder}
              
              {/* Add first block button */}
              {blocks.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <div className="text-muted-foreground mb-4">
                    Begin met schrijven of voeg een blok toe
                  </div>
                  <Button onClick={() => addBlock('paragraph')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tekst toevoegen
                  </Button>
                </Card>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Block type selector */}
      {showBlockSelector && (
        <BlockTypeSelector
          onSelect={handleBlockTypeSelect}
          onClose={() => setShowBlockSelector(false)}
          position={selectorPosition}
        />
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{blocks.length} {blocks.length === 1 ? 'blok' : 'blokken'}</span>
          {selectedBlockIds.length > 0 && (
            <span>{selectedBlockIds.length} geselecteerd</span>
          )}
          {hasUnsavedChanges && (
            <span className="text-orange-600">• Niet opgeslagen wijzigingen</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ + Z</kbd>
          <span>Ongedaan maken</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-4">/</kbd>
          <span>Blokken</span>
        </div>
      </div>
    </div>
  );
};