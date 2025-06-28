
import { sanitizeInput } from './inputSanitization';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ArticleValidationData {
  title: string;
  content: string;
  category_id: string;
  excerpt?: string;
  keywords?: string[];
}

export const validateArticleData = (data: ArticleValidationData): ValidationResult => {
  const errors: string[] = [];

  // Sanitize inputs first
  const cleanTitle = sanitizeInput(data.title);
  const cleanContent = sanitizeInput(data.content);
  const cleanExcerpt = data.excerpt ? sanitizeInput(data.excerpt) : '';

  // Title validation with length checks
  if (!cleanTitle?.trim()) {
    errors.push('Titel is verplicht');
  } else if (cleanTitle.trim().length < 3) {
    errors.push('Titel moet minimaal 3 karakters lang zijn');
  } else if (cleanTitle.trim().length > 200) {
    errors.push('Titel mag maximaal 200 karakters lang zijn');
  }

  // Content validation with strict length checks
  if (!cleanContent?.trim()) {
    errors.push('Inhoud is verplicht');
  } else if (cleanContent.trim().length < 10) {
    errors.push('Inhoud moet minimaal 10 karakters lang zijn');
  } else if (cleanContent.trim().length > 50000) {
    errors.push('Inhoud mag maximaal 50.000 karakters lang zijn');
  }

  // Category validation
  if (!data.category_id?.trim()) {
    errors.push('Categorie is verplicht');
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.category_id)) {
    errors.push('Ongeldige categorie ID');
  }

  // Excerpt validation with length check
  if (cleanExcerpt && cleanExcerpt.length > 500) {
    errors.push('Samenvatting mag maximaal 500 karakters lang zijn');
  }

  // Keywords validation with count and individual length checks
  if (data.keywords) {
    if (data.keywords.length > 10) {
      errors.push('Maximaal 10 trefwoorden toegestaan');
    }
    
    const invalidKeywords = data.keywords.filter(keyword => 
      !keyword.trim() || keyword.trim().length > 50
    );
    
    if (invalidKeywords.length > 0) {
      errors.push('Trefwoorden mogen niet leeg zijn en maximaal 50 karakters bevatten');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export interface UserValidationData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const validateUserData = (data: UserValidationData): ValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (!data.email?.trim()) {
    errors.push('Email is verplicht');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Ongeldig email formaat');
    } else if (data.email.length > 254) {
      errors.push('Email mag maximaal 254 karakters lang zijn');
    }
  }

  // Name validation with length limits
  if (data.first_name && data.first_name.length > 50) {
    errors.push('Voornaam mag maximaal 50 karakters lang zijn');
  }
  if (data.last_name && data.last_name.length > 50) {
    errors.push('Achternaam mag maximaal 50 karakters lang zijn');
  }

  // Phone validation with better regex
  if (data.phone && data.phone.trim()) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Ongeldig telefoonnummer formaat');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input length validation for preventing DoS
export const validateInputLength = (input: string, maxLength: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (input && input.length > maxLength) {
    errors.push(`${fieldName} mag maximaal ${maxLength} karakters bevatten`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
