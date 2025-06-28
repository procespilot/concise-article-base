
import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { ArticleFormData } from '@/schemas/articleSchema';

interface UseAutosaveProps {
  data: ArticleFormData;
  onSave: (data: ArticleFormData) => void;
  delay?: number;
  enabled?: boolean;
}

export const useAutosave = ({ data, onSave, delay = 10000, enabled = true }: UseAutosaveProps) => {
  const previousDataRef = useRef<string>('');
  const debouncedData = useDebounce(data, delay);

  const saveData = useCallback(() => {
    if (!enabled) return;
    
    const currentDataString = JSON.stringify(debouncedData);
    
    // Only save if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      console.log('Autosaving article data...');
      onSave(debouncedData);
      previousDataRef.current = currentDataString;
    }
  }, [debouncedData, onSave, enabled]);

  useEffect(() => {
    // Don't autosave if title or content is empty (incomplete data)
    if (!debouncedData.title?.trim() || !debouncedData.content?.trim()) {
      return;
    }

    saveData();
  }, [saveData, debouncedData.title, debouncedData.content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previousDataRef.current = '';
    };
  }, []);
};
