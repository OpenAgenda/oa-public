'use strict';

const _ = require('lodash');
const express = require('express');

module.exports = agendasSvc => ({
  load: loadBy.bind(null, agendasSvc)({ path: 'params.agendaSlug', field: 'slug' }),
  loadBy: loadBy.bind(null, agendasSvc),
  authorizeByKey
});

function loadBy(agendasSvc, { path, field, target }) {
  return (req, res, next) => {
    agendasSvc.get({
      [field]: _.get(req, path)
    }, {
      private: null,
      internal: true,
      includeImagePath: true
    }).then(agenda => {
      if (!agenda) return next({ code: 404 });
      req[target || 'agenda'] = agenda;
      next();
    }, next);
  }
}

function authorizeByKey(options) {
  _authorizeByKey(options, req).then(next, next);
}

authorizeByKey.or = (orMw, options) => (req, res, next) => {
  _authorizeByKey(options, req).then(authorized => {
    if (!authorized) {
      return express.Router({ mergeParams: true }).use(orMw)(req, res, next);
    }

    next();
  }, next);
}

async function _authorizeByKey(options, req) {
  const { keys } = req.app.services;
  const agendaUidPath = options.agendaUidPath || 'agenda.uid';

  const agendaUid = _.get(req, agendaUidPath);

  if (!agendaUid || !req.query.key) {
    return false;
  }

  const agendaKey = await keys({
    type: 'agendaFullRead',
    identifier: agendaUid,
    key: req.query.key
  }).get();

  return !!agendaKey;
}
