export interface PasswordValidationResult {
  isValid: boolean;
  errors: {
    minLength: string | null;
    hasLetter: string | null;
    hasNumber: string | null;
  };
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return {
    isValid: minLength && hasLetter && hasNumber,
    errors: {
      minLength: !minLength ? "Password must be at least 8 characters" : null,
      hasLetter: !hasLetter ? "Password must contain letters" : null,
      hasNumber: !hasNumber ? "Password must contain numbers" : null,
    },
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (criteriaMet >= 3 && password.length >= 12) return 'strong';
  if (criteriaMet >= 2 && password.length >= 8) return 'medium';
  return 'weak';
};
