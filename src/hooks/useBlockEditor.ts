import { useState, useCallback, useRef, useEffect } from 'react';
import { Block, BlockType, EditorState, Command, CommandHistory } from '@/types/block';
import { useToast } from '@/hooks/use-toast';

const HISTORY_MAX_SIZE = 50;
const AUTO_SAVE_DELAY = 2000;

export const useBlockEditor = (
  initialBlocks: Block[] = [],
  onSave?: (blocks: Block[]) => void,
  autoSave: boolean = true
) => {
  const { toast } = useToast();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [editorState, setEditorState] = useState<EditorState>({
    blocks: initialBlocks.length > 0 ? initialBlocks : [createEmptyParagraph()],
    history: [],
    currentVersion: 1,
    hasUnsavedChanges: false,
    isLoading: false,
    selectedBlockIds: []
  });

  const [commandHistory, setCommandHistory] = useState<CommandHistory>({
    commands: [],
    currentIndex: -1,
    maxSize: HISTORY_MAX_SIZE
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && editorState.hasUnsavedChanges && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        onSave(editorState.blocks);
        setEditorState(prev => ({ ...prev, hasUnsavedChanges: false }));
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editorState.blocks, editorState.hasUnsavedChanges, autoSave, onSave]);

  // Helper function to create empty paragraph
  function createEmptyParagraph(): Block {
    return {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'paragraph',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Command execution with history tracking
  const executeCommand = useCallback((command: Command) => {
    setCommandHistory(prev => {
      const newCommands = prev.commands.slice(0, prev.currentIndex + 1);
      newCommands.push(command);
      
      if (newCommands.length > prev.maxSize) {
        newCommands.shift();
      }

      return {
        ...prev,
        commands: newCommands,
        currentIndex: newCommands.length - 1
      };
    });

    setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Block operations
  const addBlock = useCallback((type: BlockType, index?: number, content: any = '') => {
    const newBlock: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const command: Command = {
      id: `cmd_${Date.now()}`,
      type: 'add',
      blockId: newBlock.id,
      data: { block: newBlock, index },
      timestamp: new Date()
    };

    setEditorState(prev => {
      const newBlocks = [...prev.blocks];
      const insertIndex = index !== undefined ? index : newBlocks.length;
      newBlocks.splice(insertIndex, 0, newBlock);
      
      return {
        ...prev,
        blocks: newBlocks,
        focusedBlockId: newBlock.id,
        hasUnsavedChanges: true
      };
    });

    executeCommand(command);
    return newBlock.id;
  }, [executeCommand]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    const command: Command = {
      id: `cmd_${Date.now()}`,
      type: 'update',
      blockId: id,
      data: { updates },
      timestamp: new Date()
    };

    setEditorState(prev => {
      const blockIndex = prev.blocks.findIndex(b => b.id === id);
      if (blockIndex === -1) return prev;

      const newBlocks = [...prev.blocks];
      newBlocks[blockIndex] = {
        ...newBlocks[blockIndex],
        ...updates,
        updatedAt: new Date()
      };

      return {
        ...prev,
        blocks: newBlocks,
        hasUnsavedChanges: true
      };
    });

    executeCommand(command);
  }, [executeCommand]);

  const deleteBlock = useCallback((id: string) => {
    const command: Command = {
      id: `cmd_${Date.now()}`,
      type: 'remove',
      blockId: id,
      data: {},
      timestamp: new Date()
    };

    setEditorState(prev => {
      const newBlocks = prev.blocks.filter(b => b.id !== id);
      
      // Ensure at least one block exists
      if (newBlocks.length === 0) {
        newBlocks.push(createEmptyParagraph());
      }

      return {
        ...prev,
        blocks: newBlocks,
        selectedBlockIds: prev.selectedBlockIds.filter(selectedId => selectedId !== id),
        hasUnsavedChanges: true
      };
    });

    executeCommand(command);
  }, [executeCommand]);

  const duplicateBlock = useCallback((id: string) => {
    const blockToDuplicate = editorState.blocks.find(b => b.id === id);
    if (!blockToDuplicate) return;

    const newBlock: Block = {
      ...blockToDuplicate,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const blockIndex = editorState.blocks.findIndex(b => b.id === id);
    const command: Command = {
      id: `cmd_${Date.now()}`,
      type: 'duplicate',
      blockId: newBlock.id,
      data: { originalId: id, block: newBlock, index: blockIndex + 1 },
      timestamp: new Date()
    };

    setEditorState(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      
      return {
        ...prev,
        blocks: newBlocks,
        focusedBlockId: newBlock.id,
        hasUnsavedChanges: true
      };
    });

    executeCommand(command);
    return newBlock.id;
  }, [editorState.blocks, executeCommand]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const command: Command = {
      id: `cmd_${Date.now()}`,
      type: 'move',
      blockId: editorState.blocks[fromIndex].id,
      data: { fromIndex, toIndex },
      timestamp: new Date()
    };

    setEditorState(prev => {
      const newBlocks = [...prev.blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      
      return {
        ...prev,
        blocks: newBlocks,
        hasUnsavedChanges: true
      };
    });

    executeCommand(command);
  }, [editorState.blocks, executeCommand]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (commandHistory.currentIndex < 0) return;

    const command = commandHistory.commands[commandHistory.currentIndex];
    
    // Reverse the command
    setEditorState(prev => {
      let newBlocks = [...prev.blocks];
      
      switch (command.type) {
        case 'add':
          newBlocks = newBlocks.filter(b => b.id !== command.blockId);
          break;
        case 'remove':
          // Would need to store original block data to restore
          break;
        case 'update':
          // Would need to store original state to restore
          break;
        case 'move':
          const { fromIndex, toIndex } = command.data;
          const [movedBlock] = newBlocks.splice(toIndex, 1);
          newBlocks.splice(fromIndex, 0, movedBlock);
          break;
      }

      if (newBlocks.length === 0) {
        newBlocks.push(createEmptyParagraph());
      }

      return {
        ...prev,
        blocks: newBlocks,
        hasUnsavedChanges: true
      };
    });

    setCommandHistory(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1
    }));

    toast({
      title: "Ongedaan gemaakt",
      description: "Laatste actie is ongedaan gemaakt",
    });
  }, [commandHistory, toast]);

  const redo = useCallback(() => {
    if (commandHistory.currentIndex >= commandHistory.commands.length - 1) return;

    const command = commandHistory.commands[commandHistory.currentIndex + 1];
    
    // Re-execute the command
    setEditorState(prev => {
      let newBlocks = [...prev.blocks];
      
      switch (command.type) {
        case 'add':
          const { block, index } = command.data;
          const insertIndex = index !== undefined ? index : newBlocks.length;
          newBlocks.splice(insertIndex, 0, block);
          break;
        case 'move':
          const { fromIndex, toIndex } = command.data;
          const [movedBlock] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, movedBlock);
          break;
      }

      return {
        ...prev,
        blocks: newBlocks,
        hasUnsavedChanges: true
      };
    });

    setCommandHistory(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1
    }));

    toast({
      title: "Opnieuw uitgevoerd",
      description: "Actie is opnieuw uitgevoerd",
    });
  }, [commandHistory, toast]);

  // Selection management
  const selectBlock = useCallback((id: string, multi: boolean = false) => {
    setEditorState(prev => {
      if (multi) {
        const isSelected = prev.selectedBlockIds.includes(id);
        return {
          ...prev,
          selectedBlockIds: isSelected 
            ? prev.selectedBlockIds.filter(selectedId => selectedId !== id)
            : [...prev.selectedBlockIds, id]
        };
      } else {
        return {
          ...prev,
          selectedBlockIds: [id],
          focusedBlockId: id
        };
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      selectedBlockIds: [],
      focusedBlockId: undefined
    }));
  }, []);

  // Focus management
  const focusBlock = useCallback((id: string) => {
    setEditorState(prev => ({
      ...prev,
      focusedBlockId: id
    }));
  }, []);

  // Save manually
  const saveBlocks = useCallback(() => {
    if (onSave) {
      onSave(editorState.blocks);
      setEditorState(prev => ({ ...prev, hasUnsavedChanges: false }));
      toast({
        title: "Opgeslagen",
        description: "Alle wijzigingen zijn opgeslagen",
      });
    }
  }, [editorState.blocks, onSave, toast]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 's':
          e.preventDefault();
          saveBlocks();
          break;
      }
    }
  }, [undo, redo, saveBlocks]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // State
    blocks: editorState.blocks,
    hasUnsavedChanges: editorState.hasUnsavedChanges,
    isLoading: editorState.isLoading,
    focusedBlockId: editorState.focusedBlockId,
    selectedBlockIds: editorState.selectedBlockIds,
    
    // Block operations
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    
    // History operations
    undo,
    redo,
    canUndo: commandHistory.currentIndex >= 0,
    canRedo: commandHistory.currentIndex < commandHistory.commands.length - 1,
    
    // Selection operations
    selectBlock,
    clearSelection,
    focusBlock,
    
    // Save operations
    saveBlocks,
    
    // Utility
    createEmptyParagraph
  };
};