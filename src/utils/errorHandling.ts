
import { useToast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export const handleError = (error: unknown, toast: ReturnType<typeof useToast>['toast']) => {
  console.error('Application error:', error);
  
  let message = 'Er is een onverwachte fout opgetreden';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = (error as any).message;
  }

  toast({
    title: "Fout",
    description: message,
    variant: "destructive"
  });
};

export const createAppError = (message: string, code?: string, details?: any): AppError => {
  return { message, code, details };
};

export const isSupabaseError = (error: any): boolean => {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
};

export const getSupabaseErrorMessage = (error: any): string => {
  if (!isSupabaseError(error)) return 'Onbekende fout';
  
  switch (error.code) {
    case 'PGRST116':
      return 'Geen gegevens gevonden';
    case '23505':
      return 'Deze gegevens bestaan al';
    case '23503':
      return 'Gerelateerde gegevens ontbreken';
    case '42501':
      return 'Onvoldoende rechten voor deze actie';
    default:
      return error.message || 'Database fout';
  }
};
