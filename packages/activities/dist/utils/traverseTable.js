"use strict";

var async = require('async');

module.exports = function (knex, table, queryModifier, eachCb, cb) {

  var rowsCount = 0;
  var rowsAffected = 0;

  async.doWhilst(function (dcb) {

    var query = knex(table).offset(rowsAffected).limit(100);

    queryModifier(query).then(function (rows) {

      rowsCount = rows.length;
      rowsAffected += rows.length;

      if (!rows.length) return dcb();

      async.eachOfSeries(rows, function (item, i, ecb) {
        eachCb(item, rowsAffected - rows.length + Number.parseInt(i), ecb);
      }, dcb);
    });
  }, function () {
    return rowsCount > 0;
  }, function (err) {

    cb(err, rowsAffected);
  });
};
//# sourceMappingURL=traverseTable.js.map