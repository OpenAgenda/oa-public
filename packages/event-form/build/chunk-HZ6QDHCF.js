// src/utils/identifyLanguageChanges.js
import _ from "lodash";
var identifyLanguageChanges_default = (before, after) => {
  if (!after) {
    return {
      removed: [],
      swapped: [],
      has: false
    };
  }
  const changes = {
    added: _.difference(after, before),
    removed: _.difference(before, after)
  };
  changes.swapped = before.length === after.length && changes.added.length ? changes.added : [];
  return _.assign(changes, {
    has: !!(changes.swapped.length || changes.added.length || changes.removed.length)
  });
};

export {
  identifyLanguageChanges_default
};
//# sourceMappingURL=chunk-HZ6QDHCF.js.map