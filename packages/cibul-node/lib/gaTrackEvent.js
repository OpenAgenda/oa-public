'use strict';

const _ = require('lodash');
const axios = require('axios');
const qs = require('qs');
const pThrottle = require('p-throttle');

// https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters

module.exports = function gaTrackEvent(gaTrackingId, cid, category, action, label, rest) {
  return axios.post('http://www.google-analytics.com/collect', qs.stringify({
    // API Version.
    v: '1',
    // Tracking ID / Property ID.
    tid: gaTrackingId,
    // Client ID.
    cid,
    // Event hit type.
    t: 'event',
    // Event category.
    ec: category,
    // Event action.
    ea: action,
    // Event label.
    el: label,
    // Rest ...
    ...rest,
  }));
};

module.exports.batch = function gaTrackEventBatch(gaTrackingId, cid, events, rest) {
  const throttledPost = pThrottle(axios.post, 1, 1000);
  const eventChunks = _.chunk(events, 20);
  const requests = [];

  for (const chunk of eventChunks) {
    const data = chunk
      .map(([category, action, label, eventRest]) => qs.stringify({
        // API Version.
        v: '1',
        // Tracking ID / Property ID.
        tid: gaTrackingId,
        // Client ID.
        cid,
        // Event hit type.
        t: 'event',
        // Event category.
        ec: category,
        // Event action.
        ea: action,
        // Event label.
        el: label,
        // Rest ...
        ...rest,
        ...eventRest,
      }))
      .join('\n');

    requests.push(throttledPost('http://www.google-analytics.com/batch', data));
  }

  return Promise.all(requests);
};
