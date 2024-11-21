export default (age) => {
  if (
    (age && age.max === null && age.min === null)
    || (age && !Object.keys(age).length)
  ) return null;
  return age;
};
