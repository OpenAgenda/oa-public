import _ from 'lodash';
import { applyContextLink } from '../eventNavigation.js';
import { getValue as getBeginValue } from '../timings/begin.js';
import detailedTiming from '../timings/detailed.js';
import relativeTimings from '../timings/relative.js';
import applySchemaJSONLD from './applySchemaJSONLD.js';
import flatten from './flattenMultilingual.js';
import links from './links.js';
import defineEventTimezone from './defineEventTimezone.js';
import spreadPerMonthPerDay from './spreadPerMonthPerDay.js';

function _preEventTransform(options, event, req, res) {
  return [
    flatten.bind(
      null,
      [
        'dateRange',
        'range',
        'title',
        'description',
        'longDescription',
        'html',
        'conditions',
        'location.access',
        'location.description',
      ],
      { lang: res.locals.lang, fallbackLang: res.locals.fallbackLang },
    ),
    defineEventTimezone.bind(null, options),
    _.partialRight(relativeTimings, { lang: res.locals.lang }),
    links.bind(null, res.locals),
  ].reduce((e, fn) => fn(e), event);
}

function _postEventTransform(options, event, req, res) {
  const { eventHook } = options;

  return [
    applySchemaJSONLD,
    eventHook ? _.partialRight(eventHook, res.locals) : (e) => e,
  ].reduce((e, fn) => fn(e, options), event);
}

export default (options) => {
  const preTransform = _preEventTransform.bind(null, options);
  const postTransform = _postEventTransform.bind(null, options);

  return {
    listItem: (event, req, res, listContext) => {
      const transformed = preTransform(event, req, res);

      return applyContextLink(
        req,
        res,
        listContext,
        postTransform(transformed, req, res),
      );
    },

    show: (event, req, res) => {
      const transformed = preTransform(event, req, res);

      transformed.timings = transformed.timings.map((t) =>
        detailedTiming({ event: transformed, req }, t, res.locals.lang));

      transformed.months = spreadPerMonthPerDay(
        transformed.timings,
        transformed.timezone || transformed.location.timezone,
        res.locals.lang,
      );

      if (_.get(req, 'params.timing')) {
        transformed.timing = _.find(
          transformed.timings,
          (t) =>
            `${new Date(getBeginValue(t)).getTime()}` === req.params.timing,
        );
      }

      return postTransform(transformed, req, res);
    },
  };
};
