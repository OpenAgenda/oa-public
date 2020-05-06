'use strict';

/*
 * test/common.js: common utility functions used in multiple tests
 */

/*
 * Remove full paths and relative line numbers from stack traces so that we can
 * compare against "known-good" output.
 */
module.exports.cleanStack = function cleanStack(stacktxt) {
  const re = new RegExp('\\(/.*/test.*js:\\d+:\\d+\\)', 'gm');
  return stacktxt.replace(re, '(dummy filename)');
};

/*
 * Node's behavior with respect to Error's names and messages changed
 * significantly with v0.12, so a number of tests regrettably need to check for
 * that.
 */
module.exports.oldNode = function oldNode() {
  return /^0\.10\./.test(process.versions.node);
};
