import ky from 'ky';

const completeUrl = (url) => {
  if (url.includes('/matomo.php')) return url;
  if (url.slice(-1) === '/') return `${url}matomo.php`;
  return `${url}/matomo.php`;
};

export default function matomoTrackEvent({
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

  return ky.post(`https://${completedUrl}`, {
    body: new URLSearchParams(payload),
    headers: {
      Origin: rootPath,
    },
  });
}
