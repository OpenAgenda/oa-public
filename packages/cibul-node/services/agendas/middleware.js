'use strict';

const _ = require('lodash');
const express = require('express');
const cmn = require('../../lib/commons-app');
const forbiddenLabel = require('@openagenda/labels')(require('@openagenda/labels/agendas/forbidden'));

module.exports = agendasSvc => ({
  load: loadBy.bind(null, agendasSvc)({ path: 'params.agendaSlug', field: 'slug' }),
  loadBy: loadBy.bind(null, agendasSvc),
  authorizeByKey,
  authorizeByIPAddress
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

function defaultOnUnauthorizedIPAddress(options = {}) {
  const params = _.merge({
    namespaces: {
      agenda: 'agenda' // loaded agenda
    }
  }, options);

  const loadBaseData = cmn.loadBaseData('oasfmain.css');

  return (req, res) => {
    const agenda = req[params.namespaces.agenda].data || req[params.namespaces.agenda];

    res.status(403);

    loadBaseData(req, res);

    cmn.render(req, res, 'dialog/index', {
      agenda: agenda,
      title: forbiddenLabel('title', req.lang),
      content: forbiddenLabel('content', req.lang),
      actions: [
        {
          type: 'primary',
          href: `/agendas/${agenda.uid}/contact`,
          label: forbiddenLabel('contact', req.lang)
        }, {
          type: 'default',
          href: `/agendas/${agenda.uid}`,
          label: forbiddenLabel('back', req.lang)
        }
      ]
    });
  };
}

function authorizeByIPAddress(options = {}) {
  const params = _.merge({
    namespaces: {
      agenda: 'agenda' // loaded agenda
    },
    onUnauthorizedIPAddress: defaultOnUnauthorizedIPAddress(options)
  }, options);

  return (req, res, next) => {
    // annoying. when evaluating an instance, data is in .data
    const data = req[params.namespaces.agenda].data || req[params.namespaces.agenda];

    const authorizedIPs = (typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings).contribution.authorizedIPAddresses;

    if (!authorizedIPs || !authorizedIPs.length) {
      return next();
    }

    const IP = (req.header('x-forwarded-for') || '').split(', ')[0];

    if (authorizedIPs.includes(IP)) {
      return next();
    }

    params.onUnauthorizedIPAddress(req, res, next);
  };
}
