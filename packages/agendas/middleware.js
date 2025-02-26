'use strict';

const _ = require('lodash');

let service;

function _getIdentifiers(namespaces, req) {
  const identifiers = {};

  _.forIn(namespaces, (v, k) => {
    if (!v) return;

    identifiers[k] = _.get(req, v);
  });

  return identifiers;
}

function load(options) {
  const params = _.merge(
    {
      instanciate: false,
      internal: false,
      private: false,
      includeImagePath: false,
      namespaces: {
        identifiers: {
          id: 'agendaId',
          uid: 'agendaUid',
          slug: 'agendaSlug',
        },
        result: 'agenda',
      },
    },
    options || {},
  );

  return (req, res, next) => {
    const identifiers = _getIdentifiers(params.namespaces.identifiers, req);

    service.get(
      identifiers,
      _.pick(params, [
        'instanciate',
        'internal',
        'private',
        'includeImagePath',
      ]),
      (err, agenda) => {
        if (err) return next(err);

        _.set(req, params.namespaces.result, agenda);

        next();
      },
    );
  };
}

function init(c, svc) {
  service = svc;
}

module.exports = {
  init,
  load,
};
