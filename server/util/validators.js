module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (!username) {
    errors.username = 'Username is required';
  }
  if (!email) {
    errors.email = 'Email is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
}

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (!email) {
    errors.email = 'Email is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
}