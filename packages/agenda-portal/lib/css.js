'use strict';

const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const sass = require('node-sass');
const resolve = require('resolve');
const log = require('./Log')('lib/css');

const render = promisify(sass.render);
let pnp;

try {
  // eslint-disable-next-line global-require, import/no-unresolved
  pnp = require('pnpapi');
} catch (error) {
  // pnpapi is not defined
  pnp = null;
}

function avoidError(fn, ...args) {
  try {
    return fn(...args);
  } catch (e) {
    return null;
  }
}

function importer(uri, prev, done) {
  const extensions = ['.scss', '.sass'];

  const uriParts = uri.split('/');
  const lastPart = uriParts.pop();
  const alternativeLastPart = `_${lastPart}`;
  const alternativeUri = [...uriParts, alternativeLastPart].join('/');

  const relativisedUri = path.isAbsolute(uri) || uri[0] === '.' || uri[0] === '/'
    ? null
    : `./${uri}`;
  const relativisedAlternativeUri = path.isAbsolute(uri) || uri[0] === '.' || uri[0] === '/'
    ? null
    : `./${alternativeUri}`;

  const joined = path.join(path.dirname(prev), uri);
  const alternativeJoined = path.join(path.dirname(prev), alternativeUri);

  const uris = [
    joined,
    alternativeJoined,
    uri, // neededFile
    alternativeUri, // _neededFile
    relativisedUri, // ./neededFile
    relativisedAlternativeUri // ./_neededFile,
  ];
  let resolution;

  for (const uriToTest of uris) {
    if (!uriToTest) {
      continue;
    }

    const result = pnp
      ? avoidError(pnp.resolveRequest, uriToTest, path.dirname(prev), {
        extensions,
        considerBuiltins: false
      })
      : avoidError(resolve.sync, uriToTest, {
        basedir: path.dirname(prev),
        extensions
      });

    if (result && extensions.includes(path.extname(result))) {
      resolution = result;
      break;
    }
  }

  readFile(resolution || uri, 'utf-8').then(
    contents => done({ file: resolution || uri, contents }),
    done
  );
}

async function _cssify(src, dst) {
  log('creating css %s from %s', dst, src);

  try {
    const { css } = await render({
      file: src,
      importer
    });

    await writeFile(dst, css);
  } catch (e) {
    console.log(e);
    log('\n\n\nSASS ERROR:\n\nfile: %s\n\n%s\n\n', e.file, e.formatted);
  }
}

function _middleware({ from, to }, req, res, next) {
  _cssify(from, to).then(next);
}

function _cssName(sassFile) {
  const parts = sassFile.split('.');

  parts.pop();

  return `${parts
    .join('.')
    .split('/')
    .pop()}.css`;
}

function buildCss(sassFile, cssDestinationFolder) {
  return _cssify(sassFile, `${cssDestinationFolder}/${_cssName(sassFile)}`);
}

function appendCssBuildMiddleware(app, sassFile, cssDestinationFolder) {
  app.use(
    `/${_cssName(sassFile)}`,
    _middleware.bind(null, {
      from: sassFile,
      to: `${cssDestinationFolder}/${_cssName(sassFile)}`
    })
  );
}

module.exports = {
  appendCssBuildMiddleware,
  buildCss
};
