export const formatValidationError = errors => {
  // No error object or issues
  if (!errors || !errors.issues) return 'Validation failed';

  // If issues is an array, map messages and join them into one string
  if (Array.isArray(errors.issues))
    return errors.issues.map(i => i.message).join(', ');

  //Otherwise, just stringify whatever came in
  return JSON.stringify(errors);
};
