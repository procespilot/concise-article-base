
export const escapeForSearch = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Escape special characters for PostgreSQL ILIKE queries
  return query
    .replace(/[%_\\]/g, '\\$&')
    .replace(/'/g, "''")
    .trim()
    .slice(0, 100); // Limit search query length
};

export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
