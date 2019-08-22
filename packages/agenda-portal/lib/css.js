'use strict';

const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);

const sass = require('node-sass');

const log = require('./Log')('lib/css');

const render = promisify(sass.render);

async function _cssify(src, dst) {
  log('creating css %s from %s', dst, src);

  try {
    const { css } = await render({ file: src });

    await writeFile(dst, css);
  } catch (e) {
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
