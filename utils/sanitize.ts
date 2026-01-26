/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize user input by removing potentially dangerous characters
 * Use this for text inputs that will be displayed back to users
 */
export const sanitizeInput = (input: string): string => {
    if (!input) return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};

/**
 * Sanitize HTML content while preserving safe tags
 * Removes script tags and event handlers
 */
export const sanitizeHTML = (html: string): string => {
    if (!html) return '';

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
    if (!email) return '';

    return email
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9@._-]/g, '');
};

/**
 * Validate and sanitize phone numbers (Moroccan format)
 */
export const sanitizePhone = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeURL = (url: string): string => {
    if (!url) return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')
    ) {
        return '';
    }

    return url.trim();
};

/**
 * Validate that a string is a safe integer
 */
export const sanitizeInteger = (value: string | number): number => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return isNaN(num) ? 0 : Math.floor(num);
};

/**
 * Validate that a string is a safe float
 */
export const sanitizeFloat = (value: string | number): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
};

/**
 * Remove all HTML tags from a string
 */
export const stripHTML = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

/**
 * Encode special characters for safe display
 */
export const encodeSpecialChars = (text: string): string => {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Validate file extension for uploads
 */
export const isValidFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
    if (!filename) return false;

    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename) return '';

    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255); // Limit length
};
