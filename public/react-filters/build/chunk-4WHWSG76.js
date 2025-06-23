// src/utils/customFirst.js
function customFirst(a, b) {
  if (a.type === "custom" && b.type !== "custom") {
    return -1;
  }
  if (a.type !== "custom" && b.type === "custom") {
    return 1;
  }
  return 0;
}

export {
  customFirst
};
//# sourceMappingURL=chunk-4WHWSG76.js.map