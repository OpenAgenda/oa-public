"use strict";

var w = require('when');

module.exports = function (interfaces, v) {

  if (!v.query.agendaId) {

    return v;
  }

  var d = w.defer();

  interfaces.getExistingCredentials(v.query.agendaId, function (err, existingCredentials) {

    if (err) return d.reject(err);

    // filter out credentials that are not in existing credentials
    v.query.credentials = v.query.credentials && v.query.credentials.length ? v.query.credentials.filter(function (c) {
      return existingCredentials.indexOf(c) !== -1;
    }) : existingCredentials;

    d.resolve(v);
  });

  return d.promise;
};
//# sourceMappingURL=evaluateCredentialFilter.js.map