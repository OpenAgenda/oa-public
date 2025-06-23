// src/utils/matchQuery.js
import isMatch from "lodash/isMatch.js";
import omitBy from "lodash/omitBy.js";
import isEmpty from "lodash/isEmpty.js";
function matchQuery(a, b) {
  return isMatch(omitBy(a, isEmpty), omitBy(b, isEmpty));
}

export {
  matchQuery
};
//# sourceMappingURL=chunk-JCQAUF4W.js.map