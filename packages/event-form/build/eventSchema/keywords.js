"use strict";

var multilingual = require('@openagenda/validators/multilingual');

var _ = {
  keys: require('lodash/keys')
};

var validate = multilingual({
  max: 255,
  list: true,
  optional: true
});

module.exports = function () {
  return function (value) {

    var clean = validate(value);

    var splitCommas = {};

    _.keys(clean).forEach(function (lang) {

      splitCommas[lang] = clean[lang].reduce(function (carry, value) {
        return carry.concat(value.split(',').map(function (v) {
          return v.trim();
        }));
      }, []);
    });

    return splitCommas;
  };
};
//# sourceMappingURL=keywords.js.map