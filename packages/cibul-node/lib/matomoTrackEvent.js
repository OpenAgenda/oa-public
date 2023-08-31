'use strict';

const axios = require('axios');

const completeUrl = url => {
  if (url.includes('/matomo.php')) return url;
  if (url.slice(-1) === '/') return `${url}matomo.php`;
  return `${url}/matomo.php`;
};

module.exports = function matomoTrackEvent(matomoUrl, matomoSiteId, category, action, label, rest) {
  const completedUrl = completeUrl(matomoUrl);
  const payload = {
    idsite: matomoSiteId,
    rec: '1',
    url: rest?.dl,
    action_name: `${category}_${action}_${label}`,
    // Additional optional parameters
    /*     cvar: JSON.stringify({
        '1': ['Custom Dimension Name', 'Custom Dimension Value'],
      }), */
  };

  return axios.post(`https://${completedUrl}`, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://d.openagenda.com',
    },
  });
};
