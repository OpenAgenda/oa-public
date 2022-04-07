'use strict';

const ih = require('immutability-helper');

const flatten = require('../lib/flatten');

module.exports.stream = function stream(members, req, res, next) {
  req.stream = members.stream(ih(req.query, {
    agendaUid: { $set: req.agenda.uid }
  }), { order: req.order }, {
    detailed: true,
    transform: flatten(req.lang)
  });

  next();
};
