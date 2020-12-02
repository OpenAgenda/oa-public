'use strict';

const _ = require('lodash');
const moment = require('moment');

const flatten = require('../events/flattenMultilingual');
const relativeTimings = require('../timings/relative');
const { applyContextLink } = require('../eventNavigation');
const links = require('../events/links');

/**
 * event is parsed by parsers listed here before being provided to views
 */

module.exports = ({
  // eventsPerPage,
  lang, // language in which the event is to be flattened
  eventParser // project-specific parser
  // root // root path for portal
}) => (e, req = null, res = null, context = null) => [
  flatten.bind(null, ['range', 'title', 'description', 'html'], lang),
  _.partialRight(relativeTimings, { lang }),
  _.partialRight(links, { lang, res }),
  context ? applyContextLink.bind(null, { req, context }) : _.noop,
  eventParser ? _.partialRight(eventParser, { lang, moment }) : _.noop
].reduce((result, fn) => fn(result), e);
