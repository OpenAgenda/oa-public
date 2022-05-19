'use strict';

const decorateTimings = require('./decorateTimings');
const markdownToHTML = require('./markdownToHTML');
const spreadRegistration = require('./spreadRegistration');
const cloudimage = require('./cloudimage');
const I18N = require('./I18N');
const loadEnvironment = require('./loadEnvironment');
const imageToUrl = require('./imageToUrl');
const decorateOptionedFieldValues = require('./decorateOptionedFieldValues');

module.exports = {
  decorateTimings,
  markdownToHTML,
  cloudimage,
  spreadRegistration,
  loadEnvironment,
  I18N,
  imageToUrl,
  decorateOptionedFieldValues
};
