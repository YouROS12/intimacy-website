// Password validation utilities

export interface PasswordStrength {
    score: number; // 0-4
    label: 'weak' | 'fair' | 'good' | 'strong';
    color: string;
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
    };
    isValid: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedCount = Object.values(requirements).filter(Boolean).length;

    let score: number;
    let label: PasswordStrength['label'];
    let color: string;

    if (passedCount <= 2) {
        score = 1;
        label = 'weak';
        color = 'bg-red-500';
    } else if (passedCount === 3) {
        score = 2;
        label = 'fair';
        color = 'bg-yellow-500';
    } else if (passedCount === 4) {
        score = 3;
        label = 'good';
        color = 'bg-blue-500';
    } else {
        score = 4;
        label = 'strong';
        color = 'bg-green-500';
    }

    // Password is valid only if it meets minimum requirements
    const isValid = requirements.minLength && requirements.hasUppercase &&
        requirements.hasLowercase && requirements.hasNumber;

    return { score, label, color, requirements, isValid };
};

export const PASSWORD_RULES = [
    { key: 'minLength', label: 'At least 8 characters' },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
    { key: 'hasNumber', label: 'One number (0-9)' },
    { key: 'hasSpecial', label: 'One special character (!@#$%...)' },
] as const;
