'use strict';

const path = require('node:path');

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

  return callerfile.replace('file://', '');
}

function getModule(dir) {
  if (dir === '/') {
    throw new Error(`Could not find package.json up from ${dir}`);
  } else if (!dir || dir === '.') {
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

  return getModule(path.dirname(dir));
}

module.exports = {
  getCallerFile,
  getModule,
};
