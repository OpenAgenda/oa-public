'use strict';

const axios = require('axios');

module.exports = function matomoTrackEvent(matomoUrl, matomoSiteId, category, action, label, rest) {
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

  return axios.post(`https://${matomoUrl}matomo.php`, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://d.openagenda.com',
    },
  });
};
