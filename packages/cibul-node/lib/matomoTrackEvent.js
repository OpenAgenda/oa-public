'use strict';

const axios = require('axios');

const completeUrl = url => {
  if (url.includes('/matomo.php')) return url;
  if (url.slice(-1) === '/') return `${url}matomo.php`;
  return `${url}/matomo.php`;
};

module.exports = function matomoTrackEvent({
  matomoUrl,
  matomoSiteId,
  category,
  action,
  label,
  rest,
  rootPath,
}) {
  const completedUrl = completeUrl(matomoUrl);
  const payload = {
    idsite: matomoSiteId,
    rec: '1',
    url: rest?.dl,
    action_name: `${category}_${action}_${label}`,
  };

  return axios.post(`https://${completedUrl}`, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: rootPath,
    },
  });
};
