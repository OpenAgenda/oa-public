'use strict';

const decorateTimings = require('./decorateTimings');
const markdownToHTML = require('./markdownToHTML');
const spreadRegistration = require('./spreadRegistration');
const cloudimage = require('./cloudimage');

module.exports = {
  decorateTimings,
  markdownToHTML,
  cloudimage,
  spreadRegistration
};
