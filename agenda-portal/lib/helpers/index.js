'use strict';

const imageToUrl = require('../../utils/imageToUrl');
const markdownToHTML = require('../../utils/markdownToHTML');
const loadFilter = require('./loadFilter');
const loadCustom = require('./loadCustom');
const loadWidget = require('./loadWidget');

const fieldSchema = (fieldName, { data }) => data.root.agenda.schema.fields
  .find(v => v.field === fieldName);

function loadHelpers(hbs) {
  return {
    mdToHtml: markdownToHTML,
    json: JSON.stringify,
    object: ({ hash = {} } = {}) => hash,
    array: (...arr) => arr.slice(0, -1),
    concat: (...strings) => strings.slice(0, -1).join(''),
    fieldSchema,
    image: imageToUrl,
    filter: loadFilter(hbs),
    customFilter: loadCustom(hbs, 'filter'),
    widget: loadWidget(hbs),
    customWidget: loadCustom(hbs, 'widget')
  };
}

module.exports = loadHelpers;

module.exports.register = hbs => hbs.registerHelper(loadHelpers(hbs));
