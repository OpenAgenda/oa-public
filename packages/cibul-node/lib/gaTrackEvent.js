import _ from 'lodash';
import ky from 'ky';
import qs from 'qs';
import pThrottle from 'p-throttle';

// https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters

export default function gaTrackEvent(
  gaTrackingId,
  cid,
  category,
  action,
  label,
  rest,
) {
  return ky.post('https://www.google-analytics.com/collect', {
    body: qs.stringify({
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
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export const batch = function gaTrackEventBatch(
  gaTrackingId,
  cid,
  events,
  rest,
) {
  const throttledPost = pThrottle(
    (url, data) =>
      ky.post(url, {
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    1,
    1000,
  );
  const eventChunks = _.chunk(events, 20);
  const requests = [];

  for (const chunk of eventChunks) {
    const data = chunk
      .map(([category, action, label, eventRest]) =>
        qs.stringify({
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
