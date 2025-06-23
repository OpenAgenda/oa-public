// src/utils/staticRangesFirst.js
function staticRangesFirst(a, b) {
  if (a.staticRanges && !b.staticRanges) {
    return -1;
  }
  if (!a.staticRanges && b.staticRanges) {
    return 1;
  }
  return 0;
}

export {
  staticRangesFirst
};
//# sourceMappingURL=chunk-AC72QCZA.js.map