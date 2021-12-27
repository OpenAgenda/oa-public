export default function showRemoveAction({ strict, pickedLanguages, required }, l) {
  if (strict || pickedLanguages.length === 1) {
    return false;
  }

  if (required && required.includes(l)) {
    return false;
  }

  return true;
}
