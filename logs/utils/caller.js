'use strict';

const path = require('node:path');
const url = require('node:url');

function getCallerFile(stackFilePosition = 1) {
  const originalFunc = Error.prepareStackTrace;
  let callerfile;
  let pos = 0;

  try {
    const err = new Error();
    let currentfile;

    Error.prepareStackTrace = (err1, stack) => stack;

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if (currentfile !== callerfile) {
        pos += 1;
        currentfile = callerfile;
      }
      if (stackFilePosition === pos) break;
    }
  } catch (e) {
    //
  }

  Error.prepareStackTrace = originalFunc;

  // On Node's ESM (and on Windows in general) getFileName() may return a
  // file:// URL, e.g. 'file:///C:/Users/.../index.js'. A naive
  // .replace('file://', '') leaves a leading-slash path that path.resolve
  // mangles on Windows ('/C:/...' -> 'C:\\C:\\...'), so use fileURLToPath.
  if (callerfile && callerfile.startsWith('file://')) {
    return url.fileURLToPath(callerfile);
  }

  return callerfile;
}

function getModule(dir) {
  if (!dir || dir === '.') {
    throw new Error('Cannot find package.json from unspecified directory');
  }

  let contents;
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    contents = require(`${dir}/package.json`);
  } catch (error) {
    //
  }

  if (contents) return dir;

  const parent = path.dirname(dir);

  // path.dirname returns the input unchanged once it reaches a filesystem root
  // ('/' on POSIX, 'C:\\' on Windows), so compare against the parent rather than
  // a hardcoded '/' to terminate on every platform.
  if (parent === dir) {
    throw new Error(`Could not find package.json up from ${dir}`);
  }

  return getModule(parent);
}

module.exports = {
  getCallerFile,
  getModule,
};
