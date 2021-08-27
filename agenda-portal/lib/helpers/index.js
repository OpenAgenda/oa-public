'use strict';

const marked = require('marked');
const imageToUrl = require('../../utils/imageToUrl');
const loadFilter = require('./loadFilter');
const loadCustomFilter = require('./loadCustomFilter');
const loadWidget = require('./loadWidget');

const mdToHtml = md => marked(md, { breaks: true });

const fieldSchema = (fieldName, { data }) => data.root.agenda.schema.fields
  .find(v => v.field === fieldName);

function loadHelpers(hbs) {
  return {
    mdToHtml,
    json: JSON.stringify,
    object: ({ hash = {} } = {}) => hash,
    array: (...arr) => arr.slice(0, -1),
    concat: (...strings) => strings.slice(0, -1).join(''),
    fieldSchema,
    image: imageToUrl,
    filter: loadFilter(hbs),
    customFilter: loadCustomFilter(hbs),
    widget: loadWidget(hbs)
  };
}

module.exports = loadHelpers;

module.exports.register = hbs => hbs.registerHelper(loadHelpers(hbs));
