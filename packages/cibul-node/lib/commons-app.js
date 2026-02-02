/**
 * common web app module middleware and initialization functions
 */

import fs from 'node:fs';

import _ from 'lodash';
import languages from 'languages';
import qs from 'qs';
import VError from '@openagenda/verror';
import logger from '@openagenda/logs';
import templater from '@openagenda/cibul-templates';
import outdatedBrowserMw from '@openagenda/outdated-browser/middleware';
import makeLabelGetter from '@openagenda/labels';
import errorLabels from '@openagenda/labels/errors/index.js';
import unauthorizedLabels from '@openagenda/labels/errors/unauthorized.js';
import config from '../config/index.js';
import errorLogger from '../services/errors.js';
import i18n from '../i18n/i18n.js';
import layouts from '../services/lib/layouts/index.js';

const getErrorLabel = makeLabelGetter(errorLabels);
const getUnauthorizedLabel = makeLabelGetter(unauthorizedLabels);

const renderError = _.template(
  fs.readFileSync(`${import.meta.dirname}/error.tpl`, 'utf-8'),
);

const log = logger('commons-app');

function agendaMailTo(agenda) {
  const config2 = _.get(agenda, 'settings.inbox.mailto');

  if (!config2) return null;

  if (!_.get(config2, 'enabled')) return null;

  const queryParts = ['subject', 'body']
    .map((key) => ({ key, value: _.get(config2, key) }))
    .filter((item) => item.value)
    .map((item) => `${item.key}=${encodeURIComponent(item.value)}`);

  if (!queryParts.length) return `mailto:${config2.email}`;

  return `mailto:${config2.email}?${queryParts.join('&')}`;
}

/**
 * middleware for loading an logger and shoving it in the request
 */

function loadLogger(name) {
  return (req, res, next) => {
    req.log = logger.createLogger2('req').loadMetadata({
      module: name || 'unknown',
      url: req.originalUrl,
      ip: (req.header('x-forwarded-for') || '').split(', ').shift(),
      userUid: req.user && req.user.uid ? req.user.uid : null,
    });

    if (next) next();
  };
}

function _cleanLang(dirtyLang) {
  if (languages.isValid(dirtyLang) || dirtyLang === 'io') return dirtyLang;

  return 'fr';
}

/**
 * get current request language
 */

function _getLang(req) {
  if (req.lang) {
    return req.lang;
  }

  return _cleanLang(req.query ? req.query.lang : 'fr');
}

/**
 * filter out characters that will cause parse errors on browser
 */

function _filterNonParsable(str) {
  const rgx = new RegExp(
    `[${[8232, 8233].map(String.fromCharCode).join('')}]`,
    'g',
  );

  return str.replace(rgx, ' ');
}

/**
 * explicitely define lang value for current request
 */
function lang(req, res, next) {
  req.lang = 'fr';
  const { sessions } = req.app.services;

  sessions.isLogged(req).then((isLogged) => {
    if (isLogged) {
      req.lang = sessions.getCulture(req);
    }

    if (req.query.lang) {
      req.lang = _cleanLang(req.query.lang);
    }

    if ((isLogged && req.lang !== sessions.getCulture(req)) || req.query.lang) {
      req.genUrl.preload({ lang: req.lang });
    }

    if (req.cookies.translateMode) {
      req.lang = 'io';
    }

    if (next) next();
  });
}

/**
 * load static data to be used in template
 *
 * @param function func  -  optionnally shove in controller specific static data
 */

function loadBaseData(func, cssFile) {
  if (typeof func === 'string') {
    // eslint-disable-next-line no-param-reassign
    cssFile = func;
    // eslint-disable-next-line no-param-reassign
    func = false;
  }

  return (req, res, next) => {
    outdatedBrowserMw(req, res);

    const baseData = {
      head: {
        css: cssFile
          ? {
            main: `/css/${cssFile}?v=${config.cssVersion}`,
          }
          : {},
        js: {},
      },
      bottom: {
        scripts: [],
      },
      scriptsBase: '/js',
      domain: config.domain,
      cspNonce: res.locals.cspNonce,
    };

    if (func) {
      _.merge(baseData, func(req, res));
    }

    if (req.layoutData) {
      _.merge(baseData, req.layoutData);
    }

    req.baseData = _.merge(req.baseData || {}, baseData);

    if (req.outdatedBrowser) {
      // Note: bottom is before head
      req.baseData.bottom.scripts.push(
        `window.outdatedBrowserOptions = { language: "${req.lang}" };`,
      );
      req.baseData.head.js.outdated = '/js/outdated.js';
    }

    if (config.matomoCloudId) {
      req.baseData.head.js.matomo = {
        async: true,
        src: '/js/matomo.js',
        // integrity: dynamicScripts.hashes.matomo,
      };
    }

    req.baseData.translateMode = Boolean(req.cookies.translateMode);
    req.baseData.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

    if (req.cookies.translateMode) {
      // Note: bottom is before head
      req.baseData.bottom.scripts.push(
        "window._jipt = [['project', 'openagenda']];",
      );
      req.baseData.head.js.crowdin = 'https://cdn.crowdin.com/jipt/jipt.js';
    }

    if (typeof next === 'function') {
      next();
    }
  };
}

/**
 * set json data in response
 */
function renderJson(req, res, data, options = {}) {
  res.set('Content-Type', 'application/json; charset=utf-8');

  if (!res.get('Last-Modified')) {
    res.set('Cache-Control', 'no-cache');
  }

  let body = JSON.stringify(data);

  if (req.query.callback) {
    body = `${req.query.callback}(${_filterNonParsable(body)})`;
  }

  // old function that should be deprecated.
  // adding this to reduce risk of breaking change elsewhere
  if (options.code === 400) {
    res.status(options.code).write(body);
  } else {
    res.write(body);
  }

  res.end();
}

/**
 * what to do with errors... make a redirect
 */

function defineJSONResponse(req, forceJSON) {
  if (forceJSON) return true;

  if (req.headers.accept === 'application/json') {
    return true;
  }

  return !!/\.json$/.test(req.path);
}

function errorResponse(req, res, err, jsr) {
  if (!err.code) {
    if (err.statusCode) {
      err.code = err.statusCode;
    }
    if (res.statusCode !== 200) {
      err.code = res.statusCode;
    }
  }

  if (!req.log) {
    loadLogger('express')(req, res);
  }

  lang(req, res, () => {
    const jsonResponse = defineJSONResponse(req, jsr);

    if (![400, 401, 403, 404, 413].includes(err.code)) {
      errorLogger('req', err, req);
      res.code = 500;
    } else {
      res.code = err.code;
    }

    const error = typeof err === 'string' ? { message: err } : err;

    if (!req.genUrl) {
      req.genUrl = req.app.services.genUrl;
    }

    if (res.code === 413) {
      error.message = i18n(
        'Your submission is too large: maximum allowed is %max%kb, you submitted %sub%kb',
        {
          '%max%': Math.ceil(error.limit / 1000),
          '%sub%': Math.ceil(error.length / 1000),
        },
        req.lang,
      );
    } else if (error.message) {
      error.message = i18n(error.message, {}, req.lang);
    }

    if (jsonResponse) {
      renderJson(
        req,
        res,
        {
          success: false,
          message: error.message
            ? error.message
            : 'There was a problem during the handling of the request',
        },
        { code: err.code },
      );

      return;
    }

    const data = {
      code: error.code,
      message: errorLabels[error.message]
        ? getErrorLabel(error.message, req.lang)
        : error.message,
      back: _.get(error, 'back', {
        label: getErrorLabel('defaultBack', req.lang),
        link: '/',
      }),
    };

    if (Array.isArray(error?.info?.errors) && req.event) {
      data.message = getErrorLabel('invalidOrIncompleteEvent', req.lang);
    }

    const layoutData = {
      lang: req.lang,
      title: error.code,
      cspNonce: res.locals.cspNonce,
    };

    if (!error.back && req.agenda) {
      data.back = {
        label: getErrorLabel('defaultAgendaBack', req.lang),
        link: `/${req.agenda.slug}`,
      };
    }

    res.status(Number.isInteger(error.code) ? error.code : 500);

    if (req.agenda) {
      // agenda.image depends to includeImagePath option
      layoutData.agenda = {
        ...req.agenda,
        image:
          req.agenda.image
          && req.agenda.image.match(/^(?:(?:https?|ftp):\/\/|\/\/)/)
            ? req.agenda.image
            : config.s3.mainBucketPath + req.agenda.image,
      };

      res.send(layouts.agenda(renderError(data), layoutData));
    } else {
      res.send(layouts.main(renderError(data), layoutData));
    }
  });
}

function catchError(req, res, jsonResponse) {
  return (err) => {
    // For send directly a json error with next( err )
    if (err.json) {
      return res.status(err.code || 400).send(err.json);
    }

    if (err.code === 404) {
      if (!err.message) {
        err.message = getErrorLabel('pageDoesNotExist', req.lang);
      }

      res.code = 404;
      res.statusCode = 404;
    } else if (err.code === 403 && err.messageCode) {
      err.message = getUnauthorizedLabel(err.messageCode, req.lang);
    }

    errorResponse(req, res, err, jsonResponse);
  };
}

function renderTemplate(req, templatePath, data, maintain, cb) {
  const compiledData = _.merge(
    {},
    req.baseData ? req.baseData : {},
    data || {},
  );

  if (!cb) {
    // eslint-disable-next-line no-param-reassign
    cb = maintain;
    // eslint-disable-next-line no-param-reassign
    maintain = false;
  }

  compiledData.genUrl = req.genUrl;

  // maintain navigation query values

  if (maintain) {
    compiledData.page = req.query.page ? req.query.page : 1;
    compiledData.filters = req.query.filters ? req.query.filters : {};
  }

  compiledData.lang = _getLang(req);

  compiledData.env = process.env.NODE_ENV;

  compiledData.jsVersion = config.jsVersion;

  compiledData.originalUrl = req.originalUrl;

  templater(
    templatePath + (req.xhr ? '.part' : ''),
    compiledData,
    (err, result) => {
      if (err && req.xhr) {
        // xhr request has no corresponding partial
        templater(templatePath, compiledData, cb);

        return;
      }

      cb(err, result);
    },
  );
}

/**
 * render template and send response
 */

function render(req, res, templatePath, data, maintain) {
  renderTemplate(req, templatePath, data, maintain, (err, render2) => {
    if (err) {
      return catchError(req, res)(err);
    }

    const statusCode = res.statusCode || res.code || 200;

    if (!req.xhr) {
      try {
        res.writeHead(statusCode, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': res.get('Cache-Control') || 'no-cache',
        });
      } catch (e) {
        req.log.error(
          new VError(e, `Error in the render of the template ${templatePath}`),
        );
      }

      res.write(render2);

      res.end();
    } else {
      renderJson(req, res, {
        success: true,
        partial: render2,
      });
    }
  });
}

function useEmbedGoogleAnalytics(req, res, next) {
  req.googleAnalyticsId = config.embedGoogleAnalyticsId;

  next();
}

/**
 * returns middleware that redirects to given route&params ( uses req.genUrl )
 */
function redirectTo(route, params = {}, options = {}) {
  const redirectParams = _.extend(
    {
      code: 302,
      maintainQuery: false,
      raw: {},
    },
    options,
  );

  return (req, res, _next) => {
    const paramValues = _.mapValues(params, (k) => {
      if (!_.isObject(k)) {
        return _.get(req.params, k);
      }

      if (k.$raw) {
        return k.$raw;
      }

      if (k.$route || k.$base64Route) {
        const key = k.$route || k.$base64Route;

        let v = req.genUrl(
          key[0],
          _.mapValues(key[1], (r) => _.get(req.params, r)),
        );

        if (k.$base64Route) {
          v = Buffer.from(v, 'utf-8').toString('base64');
        }

        return v;
      }

      return null;
    });

    if (redirectParams.maintainQuery) {
      _.extend(paramValues, req.query);
    }

    const redirect = req.genUrl(route, paramValues);

    req.log.debug('redirecting to %s', redirect);

    if (req.xhr) {
      return renderJson(req, res, {
        success: false,
        redirect,
        code: redirectParams.code,
      });
    }

    res.redirect(redirectParams.code, redirect);
  };
}

function redirectToSignin(req, res, _next) {
  const agenda = req.agenda || _.get(req, 'agendaInstance.data');
  res.redirect(
    302,
    `${agenda ? `/${agenda.slug}` : ''}/signin?redirect=${Buffer.from(req.originalUrl, 'utf-8').toString('base64')}`,
  );
}

function makeRedirect(urlOrReq) {
  return Buffer.from(
    _.isObject(urlOrReq) ? urlOrReq.originalUrl : urlOrReq,
    'utf8',
  ).toString('base64');
}

function favoriteLinkHTML(uid) {
  return `<span class="fav js_fav_item" data-event-uid="${uid}"></span>`;
}

function _saveCookie(req, res, cookieValues) {
  const encodedCookieValues = Buffer.from(
    JSON.stringify(cookieValues),
  ).toString('base64');

  // do this both in req and res.
  req.cookies[config.cookie.name] = encodedCookieValues;

  res.cookie(config.cookie.name, encodedCookieValues, {
    maxAge: 5 * 60 * 1000,
  });
}

function _decodeCookie(req) {
  const encodedCookie = req.cookies[config.cookie.name];

  let cookieValues = {};

  if (encodedCookie) {
    try {
      cookieValues = JSON.parse(
        Buffer.from(encodedCookie, 'base64').toString(),
      );

      return cookieValues;
    } catch (e) {
      log('error', 'could not decode cookie');
    }
  }

  return {};
}

function clearCookie(req, res, key) {
  const cookieValues = _decodeCookie(req);

  if (cookieValues[key] === undefined) {
    log('info', 'cookie value to be cleared is not set', key);

    return;
  }

  delete cookieValues[key];

  _saveCookie(req, res, cookieValues);
}

function readCookie(req, res, key, clearOnRead) {
  const cookieValues = _decodeCookie(req);

  if (clearOnRead) {
    clearCookie(req, res, key);
  }

  return cookieValues[key];
}

function writeToCookie(req, res, key, value) {
  const cookieValues = _decodeCookie(req);

  cookieValues[key] = value;

  _saveCookie(req, res, cookieValues);
}

function loadLegacyRoutes(genUrl) {
  genUrl.load(
    Object.entries(config.routes.globals).reduce((accu, [name, route]) => {
      accu[name] = route.uri;
      return accu;
    }, {}),
  );
}

function redirectLegacySearch(req, res, next) {
  if (req.query.search) {
    const query = { oaq: req.query.search, ...req.query };

    query.search = undefined;

    res.redirect(
      301,
      req.baseUrl + req.path + qs.stringify(query, { addQueryPrefix: true }),
    );

    return;
  }

  next();
}

export default {
  loadLogger,

  favoriteLinkHTML,

  render, // render and serve response
  renderJson, // render and serve json
  renderTemplate, // render and serve template
  errorResponse, // render error page
  catchError, // the heir of standard error handling

  loadBaseData, // middleware.

  useEmbedGoogleAnalytics,

  makeRedirect,

  writeToCookie,
  clearCookie,
  readCookie,

  redirectLegacySearch,
  loadLegacyRoutes,

  redirectTo,
  redirectToSignin,

  agendaMailTo,

  ifIs: (path, fn) => (req, res, next) =>
    (_.get(req, path, false) ? fn(req, res, next) : next()),
  ifIsNot: (path, fn) => (req, res, next) =>
    (_.get(req, path, false) ? next() : fn(req, res, next)),

  lang,
};
