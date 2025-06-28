
/**
 * Convert hex color to HSL values for CSS variables
 */
export const hexToHsl = (hex: string): string => {
  // Remove the hash if present
  const cleanHex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

/**
 * Validate if a string is a valid hex color
 */
export const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(hex);
};

/**
 * Apply primary color to CSS custom properties
 */
export const applyPrimaryColor = (color: string): void => {
  if (!isValidHexColor(color)) {
    console.warn('Invalid hex color provided:', color);
    return;
  }

  const hsl = hexToHsl(color);
  const root = document.documentElement;
  
  // Update CSS custom properties
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  
  console.log('Applied primary color:', color, 'as HSL:', hsl);
};

/**
 * Reset to default primary color (blue)
 */
export const resetToDefaultColor = (): void => {
  applyPrimaryColor('#3B82F6');
};
