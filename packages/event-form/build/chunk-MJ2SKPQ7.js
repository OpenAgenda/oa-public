// src/utils/languageCodesAndLabels.js
import languages from "languages";
var languageCodesAndLabels_default = languages.getAllLanguageCode().map((c) => ({ value: c, label: languages.getLanguageInfo(c).nativeName })).sort((a, b) => a.label < b.label ? -1 : 1);

export {
  languageCodesAndLabels_default
};
//# sourceMappingURL=chunk-MJ2SKPQ7.js.map