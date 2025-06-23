// src/validators/keywords.js
import _ from "lodash";
import multilingual from "@openagenda/validators/multilingual.js";
var validate = multilingual({
  max: 255,
  list: true,
  optional: true
});
var keywords_default = () => (value) => {
  const clean = validate(value);
  const splitCommas = {};
  _.keys(clean).forEach((lang) => {
    splitCommas[lang] = clean[lang].reduce(
      (carry, keyword) => carry.concat((keyword || "").split(",").map((v) => v.trim())),
      []
    );
  });
  return splitCommas;
};

export {
  keywords_default
};
//# sourceMappingURL=chunk-2KU34P4D.js.map