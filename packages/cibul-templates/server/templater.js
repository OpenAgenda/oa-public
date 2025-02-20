"use strict";

const path = require('path');
const fs = require('fs');
const allLabels = require('@openagenda/labels/all');
const makeLabelGetter = require('@openagenda/labels/makeLabelGetter');

const ejs = require('ejs');
const cachedFs = require('./cachedFs');
const readFile = cachedFs.readFile;
const cn = require('../js/lib/common');
const debug = require('debug');
const log = debug('templater');

let useCache = true;
const helpers = {};

module.exports = function (templateName, data, cb) {
  if (typeof data === 'function') {
    cb = data;
    data = {};
  }

  log('loading template files for %s', templateName);

  // Chaîne les loaders qui retournent des Promesses
  _loadTemplate(templateName)()
    .then(result => _loadLabels(data.lang)(result))
    .then(result => _loadTranslator(result))
    .then(result => _loadHelpers(result))
    .then(result => _loadScripts(templateName, data.scriptsBase)(result))
    .then(result => {
      // Fusion et traitement final des données
      const layoutBottom =
        (result.layoutConfig &&
          result.layoutConfig.base &&
          result.layoutConfig.base.bottom) || {};
      const templateBottom =
        (result.config.base && result.config.base.bottom) || {};
      const dataBottom = data.bottom || {};

      const layoutTop =
        (result.layoutConfig &&
          result.layoutConfig.base &&
          result.layoutConfig.base.top) || {};
      const templateTop =
        (result.config.base && result.config.base.top) || {};
      const dataTop = data.top || {};

      data.bottom = {
        scripts: [
          ...(layoutBottom.scripts || []),
          ...(templateBottom.scripts || []),
          ...(dataBottom.scripts || [])
        ].filter((v, i, a) => a.indexOf(v) === i),
        scriptSources: [
          ...(layoutBottom.scriptSources || []),
          ...(templateBottom.scriptSources || []),
          ...(dataBottom.scriptSources || [])
        ].filter((v, i, a) => a.indexOf(v) === i),
        scriptTags: [
          ...(layoutBottom.scriptTags || []),
          ...(templateBottom.scriptTags || []),
          ...(dataBottom.scriptTags || [])
        ].filter((v, i, a) => a.indexOf(v) === i)
      };

      data.top = {
        linkTags: [
          ...(layoutTop.linkTags || []),
          ...(templateTop.linkTags || []),
          ...(dataTop.linkTags || [])
        ].filter((v, i, a) => a.indexOf(v) === i)
      };

      if (result.config.base) data = cn.extend(result.config.base, data);
      if (result.layout && result.layoutConfig && result.layoutConfig.base) {
        data = cn.extend(result.layoutConfig.base, data);
      }

      if (data.js && data.js.length) {
        data.js = data.js.map(jsName => data.scriptsBase + '/' + jsName);
      } else if (result.config.js) {
        data.js = result.config.js;
      }

      if (data.jsVersion) {
        Object.keys(data.js || {}).forEach(k => {
          data.js[k] =
            data.js[k] +
            (data.js[k].indexOf('?') === -1 ? '?' : '&') +
            'v=' +
            data.jsVersion;
        });
      }

      if (result.helpers) {
        cn.extend(data, result.helpers);
      }

      data._esc = _escape;
      data.__ = result.__;

      let templateRender = _renderTemplate(
        result.template,
        result.templateBody,
        data
      );

      if (result.layout) {
        templateRender = _renderTemplate(
          result.layout,
          result.layoutBody,
          data
        ).replace('<!-- content -->', templateRender);
      }

      if (data.env) {
        templateRender = _insertEnvironment(
          templateRender,
          data.env,
          data.cspNonce
        );
      }

      cb(null, templateRender);
    })
    .catch(cb);
};

module.exports.disableFileCache = function () {
  cachedFs.disable();
  useCache = false;
};

function _renderTemplate(filename, templateBody, data) {
  data.filename = filename;
  data.cache = useCache;
  return ejs.render(templateBody, data);
}

function _loadTranslator(data) {
  let labels = _getLabels(data.config.labels);
  let templateLabelsPath = (data.layoutConfig && data.layoutConfig.labels) || null;
  let templateLabels = templateLabelsPath ? _getLabels(templateLabelsPath) : {};
  let getLabel = makeLabelGetter(Object.assign({}, labels, templateLabels), 'en', 'en');

  data.__ = (label, values = {}) => {
    let translation = getLabel(label, values, data.lang);
    if (translation) return translation;
    translation = label;
    if (data.labels && data.labels[label]) {
      translation = data.labels[label];
    }
    for (var key in values) {
      translation = translation.replace(key, values[key]);
    }
    return translation;
  };

  return Promise.resolve(data);
}

function _getLabels(pathStr) {
  if (!pathStr) return null;
  let branches = pathStr.split('/');
  let currentBranch;
  let currentPos = allLabels;

  while (currentBranch = branches.shift()) {
    if (!branches.length) {
      return currentPos[currentBranch];
    }
    currentPos = currentPos[currentBranch];
  }
  return null;
}

function _loadTemplate(templateName) {
  return function () {
    return new Promise((resolve, reject) => {
      var baseTemplatePath = path.join(__dirname, '/../', templateName).replace('.part', '');
      var isPartial = templateName.substr(-5) === '.part';
      var data = { name: templateName.replace('.part', '') };

      log('reading contents of %s', baseTemplatePath + '.config.json');

      readFile(baseTemplatePath + '.config.json', (err, config) => {
        if (err) {
          log('could not read file at %s. Ignoring', baseTemplatePath + '.config.json');
          data.config = {};
        } else {
          try {
            data.config = JSON.parse(config);
          } catch (err) {
            log('trouble parsing config file contents: %s', config);
            data.config = {};
          }
        }

        log('reading template file');
        data.template = baseTemplatePath + (isPartial ? '.part' : '') + '.ejs';
        if (isPartial) {
          data.config.layout = false;
        }

        let promises = [
          new Promise((res, rej) => {
            readFile(data.template, (err, content) => {
              if (err) return rej(err);
              res(content);
            });
          })
        ];

        if (data.config.layout) {
          data.layout = path.join(__dirname, '/../', data.config.layout + '.ejs');
          promises.push(new Promise((res, rej) => {
            readFile(data.layout, (err, content) => {
              if (err) return rej(err);
              res(content);
            });
          }));
          promises.push(new Promise((res, rej) => {
            readFile(
              path.join(__dirname, '/../', data.config.layout + '.config.json'),
              (err, content) => {
                if (err) return rej(err);
                res(content);
              }
            );
          }));
        }

        Promise.all(promises)
          .then(results => {
            data.templateBody = results[0];
            if (data.config.layout) {
              data.layoutBody = results[1];
              try {
                data.layoutConfig = JSON.parse(results[2]);
              } catch (e) {
                return reject(e);
              }
            }
            resolve(data);
          })
          .catch(err => {
            log('Some template files could not be opened. Aborting');
            reject(err);
          });
      });
    });
  };
}

function _loadLabels(lang) {
  return function (data) {
    return new Promise((resolve, reject) => {
      var files = [data.name];
      if (data.config.layout) files.push(data.config.layout);
      if (!lang) lang = 'fr';
      data.lang = lang;
      if (lang === 'en') return resolve(data);

      let promises = files.map(name => {
        const filePath = path.join(__dirname, '/../', name + '.' + lang + '.json');
        if (!fs.existsSync(filePath)) {
          log('File not found at %s. Ignoring.', filePath);
          return Promise.resolve('{}');
        }
        return new Promise((res, rej) => {
          readFile(filePath, (err, content) => {
            if (err) {
              log('File not found at %s. Ignoring.', filePath);
              res('{}');
            } else {
              res(content);
            }
          });
        });
      });

      Promise.all(promises)
        .then(results => {
          const labels = JSON.parse(results[0] || '{}');
          if (results.length > 1) {
            cn.extend(labels, JSON.parse(results[1] || '{}'));
          }
          data.labels = labels;
          resolve(data);
        })
        .catch(reject);
    });
  };
}

function _loadHelpers(data) {
  return new Promise((resolve, reject) => {
    if (!data.config.helpers) return resolve(data);

    var helpersConfig = {
      lang: data.lang ? data.lang : 'fr',
      timezone: data.timezone ? data.timezone : '+0200'
    };

    data.helpers = {};

    for (var name in data.config.helpers) {
      if (!helpers[name]) {
        helpers[name] = require(path.join(__dirname, '/../helpers/', data.config.helpers[name]));
      }
      data.helpers[name] = helpers[name](helpersConfig);
    }

    resolve(data);
  });
}

function _loadScripts(templateName, scriptsBase) {
  return function (data) {
    return new Promise((resolve, reject) => {
      var basePath = scriptsBase ? scriptsBase : '';
      var isTemplateJs = data.config.js === true;
      if (!data.config.js || data.config.js === true) data.config.js = [];

      if (data.layoutConfig && data.layoutConfig.js === true) {
        data.config.js.push(
          basePath + '/' + cn.toCamelCase(data.config.layout.replace(/\//g, '_')) + '.js'
        );
      }
      if (isTemplateJs) {
        data.config.js.push(
          basePath + '/' + cn.toCamelCase(templateName.replace(/\//g, '_')) + '.js'
        );
      }
      resolve(data);
    });
  };
}

function _insertEnvironment(render, environment, cspNonce) {
  const nonce = cspNonce ? ` nonce="${cspNonce}"` : '';
  const script = `<script type="text/javascript"${nonce}>window.env="${environment}"</script>`;
  return render.replace('<head>', `<head>${script}`);
}

function _escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
}
