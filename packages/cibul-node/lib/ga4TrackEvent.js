'use strict';

const axios = require('axios');

module.exports = function ga4TrackEvent(gaTrackingId, secret, cid, sid, category, action, label, rest) {
  const payload = {
    client_id: cid || 'XXXXXXXXXX.YYYYYYYYYY',
    events: [
      {
        name: `${category}_${action}_${label}`,
        params: {
          engagement_time_msec: '0',
          session_id: sid,
          ...rest,
        },
      },
    ],
  };

  return axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${secret}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
