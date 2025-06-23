export default config => {
  if ((config === null || config === void 0 ? void 0 : config.type) !== 's3') {
    throw new Error("unknown store type: ".concat(config === null || config === void 0 ? void 0 : config.type));
  }
  return "https://cdn.openagenda.com/".concat(config.bucket);
};
//# sourceMappingURL=storePaths.js.map