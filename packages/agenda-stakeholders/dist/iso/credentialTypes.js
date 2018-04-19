"use strict";

module.exports.types = [{
  value: 0,
  code: 'anonymous' // not used
}, {
  value: 4,
  code: 'reader'
}, {
  value: 1,
  code: 'contributor'
}, {
  value: 3,
  code: 'moderator'
}, {
  value: 2,
  code: 'administrator'
}];

module.exports.get = function (code) {

  var matches = module.exports.list([code]);

  return matches.length ? matches[0] : undefined;
};

module.exports.list = function (codes) {

  return module.exports.types.filter(function (t) {
    return codes.indexOf(t.code) !== -1;
  }).map(function (t) {
    return t.value;
  });
};

module.exports.codes = {
  get: function get(value) {

    var matches = listCodes([value]);

    return matches.length ? matches[0] : undefined;
  },
  list: listCodes
};

module.exports.isSuperiorTo = function (cred, refCred) {
  var orEqual = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  if (cred === undefined) cred = 1;

  var rankings = [-1, -1];

  module.exports.types.forEach(function (t, i) {

    if (t.value === refCred) rankings[1] = i;

    if (t.value === cred) rankings[0] = i;
  });

  return orEqual ? rankings[0] >= rankings[1] : rankings[0] > rankings[1];
};

function listCodes(values) {

  return module.exports.types.filter(function (t) {
    return values.indexOf(t.value) !== -1;
  }).map(function (t) {
    return t.code;
  });
}
//# sourceMappingURL=credentialTypes.js.map