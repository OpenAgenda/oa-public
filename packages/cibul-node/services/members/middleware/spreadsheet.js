'use strict';

const ih = require('immutability-helper');

module.exports.stream = function stream(req, res, next) {
  const { core } = req.app.services;
  const { flattenMemberInfo } = core.agendas.utils;
  core.agendas(req.agenda.uid).get({ includeMemberSchema: true }).then(agenda => {
    const flatten = flattenMemberInfo(agenda.memberSchema, req.lang);
    return core.agendas(agenda.uid).members.stream({ order: req.order }, {
      userUid: req.user.uid,
      detailed: true,
      transform: flatten,
    }).then(resStream => {
      req.stream = resStream;
      next();
    }, next);
  }, next);
};
