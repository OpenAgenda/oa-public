// src/utils/showRemoveAction.js
function showRemoveAction({ strict, pickedLanguages, required }, l) {
  if (strict || pickedLanguages.length === 1) {
    return false;
  }
  if (required && required.includes(l)) {
    return false;
  }
  return true;
}

export {
  showRemoveAction
};
//# sourceMappingURL=chunk-2ED66MGV.js.map