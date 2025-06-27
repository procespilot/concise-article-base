
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateArticleData = (data: {
  title: string;
  content: string;
  category_id: string;
  excerpt?: string;
  keywords?: string[];
}): ValidationResult => {
  const errors: string[] = [];

  // Title validation
  if (!data.title?.trim()) {
    errors.push('Titel is verplicht');
  } else if (data.title.trim().length < 3) {
    errors.push('Titel moet minimaal 3 karakters lang zijn');
  } else if (data.title.trim().length > 200) {
    errors.push('Titel mag maximaal 200 karakters lang zijn');
  }

  // Content validation
  if (!data.content?.trim()) {
    errors.push('Inhoud is verplicht');
  } else if (data.content.trim().length < 10) {
    errors.push('Inhoud moet minimaal 10 karakters lang zijn');
  } else if (data.content.trim().length > 50000) {
    errors.push('Inhoud mag maximaal 50.000 karakters lang zijn');
  }

  // Category validation
  if (!data.category_id?.trim()) {
    errors.push('Categorie is verplicht');
  }

  // Excerpt validation
  if (data.excerpt && data.excerpt.length > 500) {
    errors.push('Samenvatting mag maximaal 500 karakters lang zijn');
  }

  // Keywords validation
  if (data.keywords && data.keywords.length > 10) {
    errors.push('Maximaal 10 trefwoorden toegestaan');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserData = (data: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (!data.email?.trim()) {
    errors.push('Email is verplicht');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Ongeldig email formaat');
    }
  }

  // Name validation
  if (data.first_name && data.first_name.length > 50) {
    errors.push('Voornaam mag maximaal 50 karakters lang zijn');
  }
  if (data.last_name && data.last_name.length > 50) {
    errors.push('Achternaam mag maximaal 50 karakters lang zijn');
  }

  // Phone validation
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
