'use strict';

const decorateTimings = require('./decorateTimings');
const markdownToHTML = require('./markdownToHTML');
const spreadRegistration = require('./spreadRegistration');
const cloudimage = require('./cloudimage');
const I18N = require('./I18N');
const loadEnvironment = require('./loadEnvironment');

module.exports = {
  decorateTimings,
  markdownToHTML,
  cloudimage,
  spreadRegistration,
  loadEnvironment,
  I18N,
};
