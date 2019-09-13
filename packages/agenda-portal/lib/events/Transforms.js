'use strict';

const _ = require('lodash');
const moment = require('moment');

const { applyContextLink } = require('../eventNavigation');
const detailedTiming = require('../timings/detailed');
const relativeTimings = require('../timings/relative');
const applySchemaJSONLD = require('./applySchemaJSONLD');
const flatten = require('./flattenMultilingual');
const links = require('./links');
const spreadPerMonthPerDay = require('./spreadPerMonthPerDay');

function _preEventTransform(options, event, req, res) {
  return [
    flatten.bind(
      null,
      ['range', 'title', 'description', 'html'],
      res.locals.lang
    ),
    relativeTimings,
    links.bind(null, res.locals)
  ].reduce((e, fn) => fn(e), event);
}

function _postEventTransform({ eventHook }, event, req, res) {
  return [
    applySchemaJSONLD,
    eventHook ? _.partialRight(eventHook, res.locals) : e => e
  ].reduce((e, fn) => fn(e), event);
}

module.exports = options => {
  const preTransform = _preEventTransform.bind(null, options);
  const postTransform = _postEventTransform.bind(null, options);

  return {
    listItem: (event, req, res, context) => {
      moment.locale(res.locals.lang);

      const transformed = preTransform(event, req, res);

      return applyContextLink(
        {
          req,
          context
        },
        postTransform(transformed, res, res)
      );
    },
    show: (event, req, res) => {
      moment.locale(res.locals.lang);

      const transformed = preTransform(event, req, res);

      transformed.timings = transformed.timings.map(
        detailedTiming.bind(null, { event: transformed, req })
      );

      transformed.months = spreadPerMonthPerDay(
        transformed.timings,
        transformed.timezone
      );

      if (_.get(req, 'params.timing')) {
        transformed.timing = _.find(
          transformed.timings,
          t => `${new Date(t.start).getTime()}` === req.params.timing
        );
      }

      return postTransform(transformed, res, res);
    }
  };
};
