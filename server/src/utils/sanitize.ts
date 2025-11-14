import xss from 'xss';

export const sanitizeInput = (input: string): string => {
  return xss(input.trim());
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
