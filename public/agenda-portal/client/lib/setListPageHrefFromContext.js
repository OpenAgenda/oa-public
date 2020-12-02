import qs from 'qs';
import base64 from '../../lib/utils/base64';

export default (href, query = {}) => {
  const current = {};
  const contextPart = href
    .split(/\?|&/)
    .filter(part => part.match(/^nc=/))
    .pop();

  if (contextPart) {
    const context = JSON.parse(
      base64.decode(decodeURIComponent(contextPart.split('nc=').pop()))
    );

    if (Object.keys((context || {}).search || {}).length) {
      Object.assign(current, context.search);
    }
  }

  Object.assign(current, query);

  const updatedHrefParts = window.location.href.split('?')[0].split('/');
  updatedHrefParts.pop(); // goes the event
  updatedHrefParts.pop(); // goes the /events/

  return `${updatedHrefParts.join('/')}?${qs.stringify({ oaq: current })}`;
};
