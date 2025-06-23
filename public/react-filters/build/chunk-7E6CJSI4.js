// src/utils/getQuerySeparator.js
function getQuerySeparator(url) {
  try {
    const urlObj = new URL(url, "http://n");
    return urlObj.search ? "&" : "?";
  } catch (error) {
    console.error("Invalid URL:", error);
    return "?";
  }
}

export {
  getQuerySeparator
};
//# sourceMappingURL=chunk-7E6CJSI4.js.map