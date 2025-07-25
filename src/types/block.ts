export interface Block {
  id: string;
  type: BlockType;
  content: any;
  meta?: BlockMeta;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'quote'
  | 'code'
  | 'image'
  | 'checklist'
  | 'callout'
  | 'divider'
  | 'table'
  | 'embed';

export interface BlockMeta {
  level?: number; // for headings
  language?: string; // for code blocks
  variant?: 'info' | 'warning' | 'success' | 'error'; // for callouts
  alignment?: 'left' | 'center' | 'right'; // for images
  size?: 'small' | 'medium' | 'large' | 'full'; // for images
  alt?: string; // for images
  caption?: string; // for images
  url?: string; // for embeds
  rows?: number; // for tables
  cols?: number; // for tables
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ImageContent {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export interface EmbedContent {
  url: string;
  type: 'youtube' | 'vimeo' | 'twitter' | 'generic';
  title?: string;
  description?: string;
  thumbnail?: string;
}

// History and versioning types
export interface BlockHistory {
  id: string;
  blocks: Block[];
  timestamp: Date;
  version: number;
  action: 'manual' | 'auto';
}

// Editor state types
export interface EditorState {
  blocks: Block[];
  history: BlockHistory[];
  currentVersion: number;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  focusedBlockId?: string;
  selectedBlockIds: string[];
}

// Commands for undo/redo
export interface Command {
  id: string;
  type: 'add' | 'remove' | 'update' | 'move' | 'duplicate';
  blockId: string;
  data: any;
  timestamp: Date;
}

export interface CommandHistory {
  commands: Command[];
  currentIndex: number;
  maxSize: number;
}