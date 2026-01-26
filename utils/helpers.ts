// Helper to validate Moroccan Phone Numbers
// Accepts formats: 0612345678, +212612345678, 05..., 07...
export const validateMoroccanPhone = (phone: string): boolean => {
    // Remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if it matches typical Moroccan patterns
    // 1. Starts with 212 followed by 5, 6, or 7 and 8 digits
    // 2. Starts with 0 followed by 5, 6, or 7 and 8 digits
    const regex = /^(212|0)(5|6|7)\d{8}$/;
  
    return regex.test(cleanPhone);
};
  
// Helper to combine City and Street into one string for DB storage
export const formatAddress = (city: string, street: string): string => {
    const cleanCity = city.trim();
    const cleanStreet = street.trim();
    if (!cleanCity) return cleanStreet;
    if (!cleanStreet) return cleanCity;
    return `${cleanCity} - ${cleanStreet}`;
};
  
// Helper to parse the DB string back into components
export const parseAddress = (fullAddress: string | undefined | null) => {
    if (!fullAddress) {
        return { city: 'Casablanca', street: '' };
    }

    const parts = fullAddress.split(' - ');
    
    // If we have at least 2 parts, assume First is City, Rest is Street
    if (parts.length >= 2) {
        return {
            city: parts[0].trim(),
            street: parts.slice(1).join(' - ').trim()
        };
    }

    // Fallback: If no separator found, return whole string as street, default city
    return {
        city: 'Casablanca',
        street: fullAddress.trim()
    };
};