
import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, alt, shift, callback }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          !!event.ctrlKey === !!ctrl &&
          !!event.altKey === !!alt &&
          !!event.shiftKey === !!shift
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useCommonShortcuts = (callbacks: {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      callback: callbacks.onSearch || (() => {}),
      description: 'Zoeken'
    },
    {
      key: 'n',
      ctrl: true,
      callback: callbacks.onNew || (() => {}),
      description: 'Nieuw item'
    },
    {
      key: 's',
      ctrl: true,
      callback: callbacks.onSave || (() => {}),
      description: 'Opslaan'
    },
    {
      key: 'Escape',
      callback: callbacks.onEscape || (() => {}),
      description: 'Annuleren'
    }
  ];

  useKeyboardShortcuts(shortcuts.filter(s => s.callback !== (() => {})));
};
