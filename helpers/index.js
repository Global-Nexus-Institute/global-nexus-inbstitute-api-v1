const validatePassword = (password) => {
  // Check if the password length is less than 8 characters
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  // Check if the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  // Check if the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  // Check if the password contains at least one digit
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one digit.";
  }
  // Check if the password contains at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  // If all checks pass, return null (or undefined)
  return null;
}


exports.validatePassword = validatePassword