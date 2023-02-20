'use strict';

const _ = require('lodash');
const async = require('async');

const utils = require('@openagenda/utils');
const tabLabels = require('@openagenda/labels')(require('@openagenda/labels/agenda-admin/tabs'));

const legacyEventSvc = require('../event');

const mwh = require('../lib/middlewareHelpers');
const svcConfig = require('./config');

let svc;

module.exports = function (agendaService) {
  svc = agendaService;

  return {
    load: loadAgenda,
    loadAdminLayout,
    search: searchEvents,
    browserCache,
    browserCacheControlData,
    decorateEvents,
    decorateEvent,
    cleanJson,
  };
};

function _hasPublishedEvents(req, agenda, cb) {
  const {
    eventSearch
  } = req.app.services;

  eventSearch.agendas(agenda).search({}, { size: 0 }).then(({ total }) => {
    cb(null, !!total);
  }, cb);
}

function _loadIsPassed(req, agenda, cb) {
  const {
    eventSearch
  } = req.app.services;

  eventSearch.agendas(agenda).search({
    timings: {
      gte: new Date()
    }
  }, { size: 0 }).then(({ total }) => {
    agenda.passed = total === 0;
    cb();
  });
}

/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda(paramName, fieldName, options) {
  const loadOptions = {
    name: 'agenda',
    required: true
  }; // options used for function, not for get

  if (arguments.length === 2 && typeof fieldName === 'object') {
    options = fieldName;

    fieldName = undefined;
  }

  if (typeof fieldName === 'undefined') {
    fieldName = paramName;
  }

  if (!options) options = {};

  // extract options for function
  ['name', 'required'].forEach(k => {
    if (options[k] === undefined) return;

    loadOptions[k] = options[k];

    delete options[k];
  });

  return function (req, res, next) {
    const getParams = {};

    getParams[fieldName] = req.params[paramName];

    if (!loadOptions.required && req.params[paramName] === undefined) {
      return next();
    }

    svc.get(getParams, options, (err, a) => {
      if (err) {
        if (err == 'agenda not found') {
          return next({ code: 404 });
        }

        return next(new Error('agenda service error'));
      }

      req[loadOptions.name] = a;

      if (options.basicLoad) return next();

      // if full load ( default )
      // is requested, more info is fetched
      _loadIsPassed(req, a, err2 => {
        if (err2) return next(err2);

        _hasPublishedEvents(req, a, (err3, has) => {
          if (err3) return next(err3);

          req[loadOptions.name].isEmpty = !has;

          next();
        });

      });
    });
  };
}

/**
 *  load data required for an agenda administration page
 */

function loadAdminLayout(req, res, next) {
  async.waterfall([

    wcb => {
      req.layoutData = {
        agenda: {
          slug: req.agenda.slug,
          uid: req.agenda.uid,
          title: req.agenda.title,
          description: req.agenda.description,
          url: req.agenda.url,
          image: req.agenda.getImage ? req.agenda.getImage(false) : req.agenda.image
        },
        bottom: {
          scriptSources: [
            '/js/verifiedLocationsCounter.js'
          ]
        }
      };

      wcb();
    },

    // define tabs to display based on credentials
    wcb => {
      _getCredentialList(req.agenda, (err, credentials) => {
        req.log('loaded credentials %s', credentials);

        if (err) return wcb(err);

        // filter tabs where agenda does not have required creds
        req.layoutData.tabs = svcConfig.adminTabs.filter(tab => {
          // if user is moderator and tab access is not given to moderators,
          // filter.
          if (req.access == 'moderator' && tab.access !== 'moderator') {
            return false;
          }

          if (tab.requiredCred === undefined) return true;

          if (credentials.includes(tab.requiredCred)) return true;

          return !!tab.call;
        })

          .map(tab => {
            const label = tabLabels(tab.key, req.lang);

            let badge = null;

            if (tab.badge) {
              badge = _.extend({}, tab.badge, { label: tabLabels(tab.badge.label, req.lang) });
            }

            if (!credentials.includes(tab.requiredCred) && tab.call) {
              tab.call.agenda = req.agenda.uid;

              tab.call.lang = req.lang;

              tab.uri = '#';
            }

            return _.assign({}, tab, {
              res: tab.res ? tab.res.replace(':slug', req.agenda.slug) : null,
              badge: badge || undefined,
              label,
              call: credentials.includes(tab.requiredCred) ? null : tab.call
            });
          });

        wcb();
      });
    },

  ], err => {
    next(err || undefined);
  });
}

function _getCredentialList(agenda, cb) {
  // legacy service function
  if (agenda.getCredentialList) {
    return agenda.getCredentialList((err, list) => {
      cb(null, list);
    });
  }

  // new service

  setImmediate(() => {
    cb(null, _.keys(_.pickBy(agenda.credentials, v => !!v)));
  });
}

function formatTemplateData(req, res, next) {
  req.template = 'agenda/show';

  req.templateData = {
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage(false),
    passed: req.agenda.passed,
    uri: 'agendaShow'
  };

  req.templateData.importUri = req.genUrl('agendaActionShow', { slug: req.agenda.slug });

  req.templateData.hasSearchQuery = !!utils.size(req.query.oaq);

  next();
}

function searchEvents(limit, showAll) {
  return function (req, res, next) {
    const pagination = {};

    if (req.query.offset) {
      pagination.offset = parseInt(req.query.offset, 10);
    } else {
      pagination.page = parseInt(req.query.page, 10);
    }

    req.limit = Math.min(parseInt(req.query.limit ? req.query.limit : limit, 10), 300) || limit;
    req.offset = pagination.offset || (pagination.page - 1) * req.limit || 0;

    req.agenda.search(req.query.oaq, {
      limit: req.limit,
      offset: req.offset,
      showAll
    }, (err, data) => {
      if (err) {
        return next({
          message: 'invalid query',
          url: req.originalUrl,
          query: req.query.oaq,
          elasticsearch: err
        });
      }

      req.events = data.events;

      req.total = data.total;

      next();
    });
  };
}

function browserCacheControlData(req, res, next) {
  req.agenda.getControlDataTimestamp((err, t) => {
    if (err) next(err);

    mwh.compareModifiedSince(t, req, res, next);
  });
}

function browserCache(req, res, next) {
  if (_hasQueryOtherThan(req, 'callback')) {
    return next();
  }

  mwh.compareModifiedSince(req.agenda.updatedAt, req, res, next);
}

function decorateEvents(includePrivateData) {
  return function (req, res, next) {
    const instanciated = req.events.map(legacyEventSvc.instanciate);

    svc.exports.decorateEvents(req.agenda, instanciated, req.formatted, {
      includePrivateData: !!includePrivateData,
      lang: false
    }, next);
  };
}

function decorateEvent(includePrivateData) {
  return function (req, res, next) {
    svc.exports.decorateEvent(req.agenda, req.event, req.formatted, {
      // this value was at false, the custom file link needs access
      includePrivateData,
      lang: req.lang,
      loadTagSet: true,
      multiLang: false
    }, next);
  };
}

function cleanJson(req, res, next) {
  req.formatted.forEach(f => {
    if (f.customValues) {
      f.custom = f.customValues;

      delete f.customValues;

      delete f.customLabels;
    }

    if (f.references) {
      f.linkedEvents = f.references;

      delete f.references;
    }

    ['image', 'thumbnail', 'originalImage'].forEach(imageField => {
      if ((f[imageField] || '').indexOf('?') === -1) {
        return;
      }
      f[imageField] = f[imageField].split('?').shift();
    });
  });

  next();
}

function _hasQueryOtherThan(req, exceptions) {
  if (typeof exceptions === 'string') exceptions = [exceptions];

  if (!exceptions) exceptions = [];

  for (const q in req.query) {
    if (exceptions.indexOf(q) == -1) return true;
  }

  return false;
}

function _fZ(n) {
  return (n > 9 ? '' : '0') + n;
}
