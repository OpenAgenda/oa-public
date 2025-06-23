// src/utils/flattenLocationTagSet.js
import _ from "lodash";
function makeFlatten(lang, defaultLang) {
  return (label) => {
    if (!label || _.isString(label)) return label;
    if (label[lang]) return label[lang];
    if (label[defaultLang]) return label[defaultLang];
    return label[_.first(_.keys(label))];
  };
}
var flattenLocationTagSet_default = (tagSet, lang, defaultLang = "en") => {
  const flatten = makeFlatten(lang, defaultLang);
  return {
    groups: tagSet.groups.map((g) => ({
      name: flatten(g.name),
      info: flatten(g.info),
      tags: g.tags.map((t) => ({ id: t.id, label: flatten(t.label) }))
    }))
  };
};

export {
  flattenLocationTagSet_default
};
//# sourceMappingURL=chunk-VB3R3CZR.js.map