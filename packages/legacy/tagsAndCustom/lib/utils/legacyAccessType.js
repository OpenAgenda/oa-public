export default (field, contributor = 'private') => {
  if (!field.read) return 'public';

  if (field.read.includes('contributor')) {
    return contributor;
  }

  if (field.read.includes('administrator')) {
    return 'administrator';
  }

  return 'private';
};
