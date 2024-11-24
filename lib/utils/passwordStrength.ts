export function checkPasswordStrength(password: string): { isStrong: boolean; message: string } {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (password.length < minLength) {
    return { isStrong: false, message: 'Password must be at least 8 characters long' };
  }

  if (!hasUpperCase) {
    return { isStrong: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!hasLowerCase) {
    return { isStrong: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!hasNumbers) {
    return { isStrong: false, message: 'Password must contain at least one number' };
  }

  if (!hasNonalphas) {
    return { isStrong: false, message: 'Password must contain at least one special character' };
  }

  return { isStrong: true, message: 'Password is strong' };
}
