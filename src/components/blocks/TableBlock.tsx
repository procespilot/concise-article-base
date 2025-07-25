import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Minus, MoreVertical, ChevronDown } from 'lucide-react';
import { Block, TableContent } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BlockActions } from './BlockActions';
import { cn } from '@/lib/utils';

interface TableBlockProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onKeyDown,
  placeholder
}) => {
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Initialize table content if it doesn't exist
  const tableContent: TableContent = block.content || {
    headers: ['Kolom 1', 'Kolom 2'],
    rows: [['', '']]
  };

  const updateTable = useCallback((newContent: TableContent) => {
    onChange({ content: newContent });
  }, [onChange]);

  const updateHeader = useCallback((index: number, value: string) => {
    const newHeaders = [...tableContent.headers];
    newHeaders[index] = value;
    updateTable({ ...tableContent, headers: newHeaders });
  }, [tableContent, updateTable]);

  const updateCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...tableContent.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    updateTable({ ...tableContent, rows: newRows });
  }, [tableContent, updateTable]);

  const addColumn = useCallback(() => {
    const newHeaders = [...tableContent.headers, `Kolom ${tableContent.headers.length + 1}`];
    const newRows = tableContent.rows.map(row => [...row, '']);
    updateTable({ headers: newHeaders, rows: newRows });
  }, [tableContent, updateTable]);

  const removeColumn = useCallback((index: number) => {
    if (tableContent.headers.length <= 1) return; // Keep at least one column
    
    const newHeaders = tableContent.headers.filter((_, i) => i !== index);
    const newRows = tableContent.rows.map(row => row.filter((_, i) => i !== index));
    updateTable({ headers: newHeaders, rows: newRows });
  }, [tableContent, updateTable]);

  const addRow = useCallback(() => {
    const newRow = new Array(tableContent.headers.length).fill('');
    const newRows = [...tableContent.rows, newRow];
    updateTable({ ...tableContent, rows: newRows });
  }, [tableContent, updateTable]);

  const removeRow = useCallback((index: number) => {
    if (tableContent.rows.length <= 1) return; // Keep at least one row
    
    const newRows = tableContent.rows.filter((_, i) => i !== index);
    updateTable({ ...tableContent, rows: newRows });
  }, [tableContent, updateTable]);

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          // Move to previous cell
          if (colIndex > 0) {
            setFocusedCell({ row: rowIndex, col: colIndex - 1 });
          } else if (rowIndex > 0) {
            setFocusedCell({ row: rowIndex - 1, col: tableContent.headers.length - 1 });
          }
        } else {
          // Move to next cell
          if (colIndex < tableContent.headers.length - 1) {
            setFocusedCell({ row: rowIndex, col: colIndex + 1 });
          } else if (rowIndex < tableContent.rows.length - 1) {
            setFocusedCell({ row: rowIndex + 1, col: 0 });
          } else {
            // Add new row if at the end
            addRow();
            setTimeout(() => setFocusedCell({ row: rowIndex + 1, col: 0 }), 50);
          }
        }
        break;
      
      case 'Enter':
        if (e.shiftKey) {
          // Add new row below current
          addRow();
          setTimeout(() => setFocusedCell({ row: rowIndex + 1, col: colIndex }), 50);
        }
        break;
      
      case 'ArrowUp':
        if (rowIndex > 0) {
          setFocusedCell({ row: rowIndex - 1, col: colIndex });
        }
        break;
      
      case 'ArrowDown':
        if (rowIndex < tableContent.rows.length - 1) {
          setFocusedCell({ row: rowIndex + 1, col: colIndex });
        }
        break;
      
      case 'ArrowLeft':
        if (colIndex > 0 && e.currentTarget.selectionStart === 0) {
          setFocusedCell({ row: rowIndex, col: colIndex - 1 });
        }
        break;
      
      case 'ArrowRight':
        const input = e.currentTarget as HTMLInputElement;
        if (colIndex < tableContent.headers.length - 1 && input.selectionStart === input.value.length) {
          setFocusedCell({ row: rowIndex, col: colIndex + 1 });
        }
        break;
      
      default:
        onKeyDown?.(e);
    }
  }, [tableContent, addRow, onKeyDown]);

  // Focus cell when focusedCell changes
  useEffect(() => {
    if (focusedCell && tableRef.current) {
      const cell = tableRef.current.querySelector(
        `[data-row="${focusedCell.row}"][data-col="${focusedCell.col}"] input`
      ) as HTMLInputElement;
      if (cell) {
        cell.focus();
      }
    }
  }, [focusedCell]);

  return (
    <div className="table-block group relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-muted-foreground">Tabel</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={addColumn}
            className="h-6 px-2 text-xs"
          >
            <Plus className="w-3 h-3" />
            Kolom
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addRow}
            className="h-6 px-2 text-xs"
          >
            <Plus className="w-3 h-3" />
            Rij
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full border-collapse border border-border rounded-md">
          <thead>
            <tr>
              {tableContent.headers.map((header, index) => (
                <th key={index} className="relative group/header">
                  <div className="flex items-center">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="border-0 rounded-none bg-muted/50 font-medium text-center h-10"
                      placeholder={`Kolom ${index + 1}`}
                    />
                    {tableContent.headers.length > 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover/header:opacity-100"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => removeColumn(index)}>
                            <Minus className="w-4 h-4 mr-2" />
                            Kolom verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableContent.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group/row">
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="relative border-t border-border p-0"
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex)}
                      onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                      className="border-0 rounded-none h-10"
                      placeholder={rowIndex === 0 && colIndex === 0 ? placeholder : ""}
                    />
                    {colIndex === row.length - 1 && tableContent.rows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                        className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100"
                        title="Rij verwijderen"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {tableContent.rows.length} {tableContent.rows.length === 1 ? 'rij' : 'rijen'} × {tableContent.headers.length} {tableContent.headers.length === 1 ? 'kolom' : 'kolommen'}
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd>
          <span>Volgende cel</span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-2">Shift + Enter</kbd>
          <span>Nieuwe rij</span>
        </div>
      </div>

      <BlockActions
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
};