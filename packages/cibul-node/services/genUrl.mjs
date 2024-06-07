import _ from 'lodash';
import qs from 'qs';
import debug from 'debug';

const log = debug('genUrl');

/**
 * extract names from uri
 */
function _getUriParamNames(uri, stripped) {
  // param names start with :,
  // are smallcase and contain only letters from a to z
  return (uri.match(/:([a-z]|[A-Z])+/g) || []).map(name => (stripped ? name.replace(':', '') : name));
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * create relative url from uri and param values
 */
function _loadParamValues(uri, values) {
  let url = uri;

  _getUriParamNames(uri).forEach(paramName => {
    if (values[paramName.replace(':', '')] === undefined) {
      throw new Error(`missing route param: ${paramName}`);
    }

    url = url.replace(paramName, values[paramName.replace(':', '')]);
  });

  return url;
}

function size(obj) {
  let s = 0;
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) s += 1;
  }
  return s;
}

/**
 * extract values which are not params of uri
 * and place them in a query object
 */
function _loadQueryValues(uri, values) {
  const queryValues = {}; const
    paramNames = _getUriParamNames(uri, true);

  for (const v in values) {
    if (!paramNames.includes(v)) {
      queryValues[v] = values[v];
    }
  }

  return size(queryValues) ? queryValues : false;
}

/**
 * concatenate if values is an array of values
 * give empty objet if values is nothing at all
 */
function _clean(values) {
  const clean = {};

  if (!values) return clean;

  if (isArray(values)) {
    values.forEach(valueSet => {
      _.merge(clean, {}, valueSet);
    });
  } else {
    _.merge(clean, {}, values);
  }

  return clean;
}

function instanciate(options) {
  const defaults = _.merge({
    domain: false, // required ( for absolute urls )
    protocol: 'http://', // or https:// or //
    abs: false,
    paths: {},
    preloaded: {},
  }, options || {});
  const { paths } = defaults;
  const preloaded = _.merge({}, defaults.preloaded);

  function genUrl(name, values, opts) {
    const genParams = _.merge({}, defaults, opts || {});
    const uri = paths[name];

    let relativeUrl;
    let url;

    // if protocol is explicitely passed,
    // caller wants an absolute url
    if (opts && opts.protocol) {
      genParams.abs = true;
    }

    if (uri === undefined) {
      log('error', 'path is not known: %s', name);

      return '#';
    }

    const cleanValues = _.merge({}, preloaded, _clean(values));

    try {
      relativeUrl = _loadParamValues(uri, cleanValues);
    } catch (e) {
      log('error', 'trouble on route %s: %s', name, e);

      return '#';
    }

    if (genParams.abs) {
      url = genParams.protocol + genParams.domain + relativeUrl;
    } else {
      url = relativeUrl;
    }

    const query = _loadQueryValues(uri, cleanValues);

    if (query) {
      url += (!url.includes('?') ? '?' : '&') + qs.stringify(query);
    }

    return url;
  }

  function load(p) {
    _.merge(paths, p);
  }

  function getPaths() {
    return paths;
  }

  function getPath(name) {
    return paths[name];
  }

  function copy() {
    const copyOptions = _.merge({}, options || {}, {
      paths,
      preloaded,
    });

    return instanciate(copyOptions);
  }

  function preload(values) {
    _.merge(preloaded, values);
  }

  function abs(uri, query) {
    return genUrl(uri, query, {
      abs: true,
      protocol: 'https://',
    });
  }

  return _.extend(genUrl, {
    load,
    getPaths,
    getPath,
    copy,
    preload,
    abs,
  });
}

export function init({ domain }) {
  return instanciate({ domain });
}
