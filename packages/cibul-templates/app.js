"use strict";

var http = require('http'),
  url = require('url'),
  path = require('path'),
  st = require('st'),
  sass = require('sass'),
  sassDestFile = '/build/sass/tmp.css',
  templater = require('./server/templater.js'),
  p = require('./server/promises'),
  mountStatic = st({ path: __dirname, url: '/', cache: false }),
  cn = require('./js/lib/common'),
  deepExtend = require('deep-extend'),
  webpack = require('webpack'),
  webpackConfigDev = require('./prodify/config.dev'),
  fs = require('fs'),
  debug = require('debug'),
  map = require('./map');

debug.enable('httpServer');

templater.disableFileCache();

var log = debug('httpServer');

http.createServer(function (req, res) {
  log('processing request %s', req.url);
  req.query = url.parse(req.url, true).query;
  p.w({ req: req, res: res, data: {} })
    .then(_loadUri)
    .then(p.ife({ uri: false }, _renderMap))
    .then(p.ifl({ responded: false }, _checkStatic))
    .done(v => {
      if (!v.responded) _prepareRender(v);
    });
}).listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0');

function _prepareRender(v) {
  p.w(v)
    // load config file
    .then(_load('config', 'uri', '.config.json', true))
    // load layout config file
    .then(p.ifl({ 'config.layout': true }, _load('layoutConfig', 'config.layout', '.config.json', true)))
    // load mock data
    .then(_load('data', 'uri', '.mock.json', true))
    // load layout mock data
    .then(p.ifl({ 'config.layout': true }, _load('layoutData', 'config.layout', '.mock.json', true)))
    // webpackify js data
    .then(p.ifl({ 'config.js': true }, _webpackifyFiles('uri', 'config.js')))
    // webpackify layout js data
    .then(p.ifl({ 'layoutConfig.js': true }, _webpackifyFiles('config.layout', 'layoutConfig.js')))
    // compile template data
    .then(_compileTemplateData)
    // append css links
    .then(_listCssFiles)
    // compile it all (sass)
    .then(_compileSass)
    // define js files root
    .then(_jsRoot)
    // define url generator
    .then(_fakeGenUrl)
    // language
    .then(_defineLanguage)
    // environment
    .then(_defineEnvironment)
    // render template
    .then(_render)
    .done(
      v => {
        _respond(v.req, v.res, 200, v.render);
      },
      err => {
        _respond(v.req, v.res, 500, 'There was a problem while loading the template: ' + err);
      }
    );
}

function _loadUri(v) {
  log('loading uri');
  var parsed = url.parse(v.req.url, true),
    uri = parsed.pathname.substr(1);
  v.uri = uri.length ? uri : false;
  return v;
}

function _checkStatic(v) {
  log('checking static file');
  if (
    cn.contains(['.js'], v.uri.substr(-3)) ||
    cn.contains(['.css', '.jpg', '.png', '.ico', '.ttf', '.svg', '.eot', '.otf', '.ejs', '.txt'], v.uri.substr(-4)) ||
    cn.contains(['.woff2'], v.uri.substr(-6)) ||
    cn.contains(['.woff', '.json', '.html'], v.uri.substr(-5))
  ) {
    log('handling as static resource request');
    mountStatic(v.req, v.res);
    v.responded = true;
  }
  return v;
}

log('IMPORTANT: if nodemon is to be used, use it with proper exclusions');

function _load(key, pathKey, suffix, throwError) {
  return function (v) {
    return p.w.promise(function (rs, rj) {
      fs.readFile(__dirname + '/' + p.getSubObject(pathKey, v) + suffix, 'utf-8', function (err, content) {
        if (err) {
          var errorMessage = 'could not read file ' + __dirname + '/' + p.getSubObject(pathKey, v) + suffix;
          log(errorMessage);
          if (throwError) return rj(errorMessage + err);
          rs(v);
          return;
        }
        v[key] = (p.getSubObject(pathKey, v) + suffix).indexOf('.json') !== -1 ? JSON.parse(content) : content;
        rs(v);
      });
    });
  };
}

function _jsIncludeMainPath(uri) {
  var parts = uri.split('/'),
    name = parts.pop();
  parts.push('js');
  return {
    src: {
      path: parts.join('/'),
      name: name
    },
    dest: {
      path: path.join(__dirname, 'build/browserified'),
      name: cn.toCamelCase(uri.replace('/', '_')) + '.js'
    }
  };
}

function _webpackifyFiles(pathKey, fileObjPath) {
  return function (v) {
    return p.w.promise(function (rs, rj) {
      var jsPaths,
        jsFiles = v;
      fileObjPath.split('.').forEach(function (part) {
        jsFiles = jsFiles[part];
      });
      if (jsFiles === true) {
        jsPaths = [_jsIncludeMainPath(p.getSubObject(pathKey, v))];
      } else {
        jsPaths = jsFiles.map(_jsIncludePath(p.getSubObject(pathKey, v)));
      }
      if (!v.js) v.js = [];
      v.js = jsPaths.map(function (path) {
        return path.dest.name;
      }).concat(v.js);
      // Remplacement de async.each par Promise.all
      Promise.all(jsPaths.map(function (pth) {
        return new Promise(function (resolve, reject) {
          _webpackify(pth, function (err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }))
        .then(function () { rs(v); })
        .catch(rj);
    });
  };
}

function _compileTemplateData(v) {
  var base = v.data.base ? v.data.base : {},
    state = v.req.query ? v.req.query.state : false;
  if (v.js) {
    cn.extend(base, { js: v.js });
  }
  if (state && v.data[state]) {
    state = v.req.query.state;
  } else {
    for (var key in v.data) {
      if (key !== 'base') {
        state = key;
        break;
      }
    }
  }
  if (state) {
    deepExtend(base, v.data[state]);
  }
  if (v.layoutData) {
    base = deepExtend(v.layoutData, base);
  }
  v.compiled = base;
  return v;
}

function _listCssFiles(v) {
  if (!v.compiled.head) v.compiled.head = {};
  var c, css;
  ['css', 'embedCss', 'oaCss', 'oaeCss', 'adminCss', 'bsCss'].forEach(function (name) {
    if (v.config[name]) {
      css = v.config[name];
      c = name;
    }
  });
  if (v.layoutConfig && v.layoutConfig[c]) {
    css = cn.extend(_absolutePath(v.config.layout, v.layoutConfig[c]), _absolutePath(v.uri, css));
  }
  v.css = css;
  return v;
}

function _compileSass(v) {
  return new Promise(function (resolve, reject) {
    var aggregated = '',
      cssArr = [];
    for (var i in v.css) {
      cssArr.push(v.css[i]);
    }
    // Traitement séquentiel de chaque fichier CSS
    let promiseChain = Promise.resolve();
    cssArr.forEach(function (cssFile) {
      promiseChain = promiseChain.then(function () {
        return new Promise(function (res, rej) {
          console.log(__dirname, cssFile);
          log('compiling %s', __dirname + cssFile);
          fs.readFile(__dirname + cssFile, 'utf-8', function (err, content) {
            if (err) return rej('could not read file ' + cssFile);
            aggregated += content;
            res();
          });
        });
      });
    });
    promiseChain.then(function () {
      if (!aggregated.length) return resolve(v);
      sass.render({ data: aggregated }, function (err, result) {
        if (err) {
          console.log('could not process sass: %s', err);
          return reject(err);
        }
        fs.writeFile(__dirname + sassDestFile, result.css.toString(), function (err) {
          if (err) {
            console.log('could not write file %s', __dirname + sassDestFile);
            return reject(err);
          }
          v.compiled.head.css = { aggregated: sassDestFile };
          resolve(v);
        });
      });
    }).catch(reject);
  });
}

function _jsRoot(v) {
  v.compiled.scriptsBase = '/build/browserified';
  return v;
}

function _fakeGenUrl(v) {
  v.compiled.genUrl = _genUrl(v.compiled);
  return v;
}

function _defineLanguage(v) {
  if (!v.req.query || !v.req.query.lang) {
    v.compiled.lang = 'fr';
  } else {
    v.compiled.lang = v.req.query.lang;
  }
  return v;
}

function _defineEnvironment(v) {
  v.compiled.env = 'tpl';
  return v;
}

function _render(v) {
  return p.w.promise(function (rs, rj) {
    templater(v.uri, v.compiled, function (err, render) {
      if (err) return rj(err);
      v.render = render;
      rs(v);
    });
  });
}

function _renderMap(v) {
  log('rendering map');
  _respond(v.req, v.res, 200, '<ul>' + map.map(function (mapItem) {
    var uri = typeof mapItem === 'string' ? mapItem : mapItem.uri;
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');
  v.responded = true;
  return v;
}

function _respond(req, res, code, body, responseType) {
  if (responseType === undefined) responseType = "text/html; charset=utf-8";
  let oaCookie = '';
  if (typeof req.query.logged !== 'undefined') {
    oaCookie += (Buffer.from(JSON.stringify({
      flash: null,
      user: {
        name: 'Gaetan Latouche',
        thumbnail: 'https://cdn.openagenda.com/main/review_kaore-olafsson_01.jpg',
        uid: 75052324,
        culture: 'fr'
      }
    }))).toString('base64');
  }
  res.writeHead(code, {
    "Content-Type": responseType,
    'Cache-Control': 'no-cache',
    'Set-Cookie': ['oa=' + oaCookie]
  });
  res.write(body);
  res.end();
}

function _jsIncludePath(name) {
  return function (jsRelativePath) {
    var paths = {
        src: {},
        dest: { path: path.join(__dirname, 'build/browserified') }
      },
      templatePath = name.split('/'),
      pathParts = jsRelativePath.split('/');
    templatePath.pop();
    paths.src.path = [];
    pathParts.forEach(function (pathPart) {
      if (pathPart !== '..') {
        paths.src.path.push(pathPart);
      } else {
        templatePath.pop();
      }
    });
    paths.src.path = templatePath.concat(paths.src.path);
    paths.dest.name = cn.toCamelCase(paths.src.path.join('_'));
    paths.src.name = paths.src.path.pop();
    paths.src.path = paths.src.path.join('/');
    return paths;
  }
}

function _webpackify(paths, cb) {
  log('browserificationization');
  const entryName = paths.dest.name.split('.').slice(0, -1).join('.');
  const webpackOpts = {
    entry: {
      [entryName]: path.resolve(paths.src.path, paths.src.name)
    },
    output: {
      filename: '[name].js',
      path: paths.dest.path
    }
  };
  const compiler = webpack(webpackConfigDev(webpackOpts));
  compiler.run(function (err, stats) {
    if (err) return cb(err);
    console.log(stats.toString({
      hash: false,
      chunks: false,
      colors: true
    }));
    cb();
  });
}

function _genUrl(data) {
  return function (name) {
    var values = {};
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        cn.extend(values, arguments[i]);
      }
    }
    if (data.devUrls && data.devUrls[name]) {
      return data.devUrls[name] + '#' + name + encodeURI(JSON.stringify(values));
    }
    return '#' + name + encodeURI(JSON.stringify(values));
  };
}

function _absolutePath(uri, css) {
  var templatePath = uri.split('/');
  templatePath.pop();
  var absCss = {};
  for (var c in css) {
    var parts = css[c].split('/');
    absCss[c] = '/' + templatePath.join('/') + '/' + parts.join('/');
  }
  return absCss;
}
