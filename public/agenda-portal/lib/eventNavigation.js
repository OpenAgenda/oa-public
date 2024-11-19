import _ from 'lodash';
import qs from 'qs';
import b64 from './utils/base64.js';

function stringifyContext(obj) {
  return b64.encode(JSON.stringify(obj));
}

function parseContext(str) {
  return JSON.parse(b64.decode(str));
}

function _listLink({ root, eventsPerPage }, context) {
  const page = Math.ceil((context.index + 1) / eventsPerPage);

  const queryPart = {};

  if (context.params) {
    Object.assign(queryPart, context.params);
  }

  if (context.lang) {
    queryPart.lang = context.lang;
  }

  return `${root}${page > 1 ? `/p/${page}` : ''}${qs.stringify(queryPart, {
    addQueryPrefix: true,
  })}`;
}

function navigation({ root, eventsPerPage }, contextStr) {
  const nav = {
    list: root,
    previous: null,
    next: null,
    total: null,
    position: null,
    available: false,
  };

  if (!contextStr) return nav;

  const context = parseContext(contextStr);

  nav.total = context.total;
  nav.position = context.index + 1;

  if (context.index > 0) {
    nav.previous = `${root}/events/nav/previous?nc=${contextStr}`;
  }

  if (context.index < context.total - 1) {
    nav.next = `${root}/events/nav/next?nc=${contextStr}`;
  }
  nav.available = !!(nav.next || nav.previous || nav.list);

  nav.list = _listLink({ root, eventsPerPage }, context);

  return Object.assign(nav, _.pick(context, ['total', 'offset']));
}

function applyContextLink(req, res, listContext, event) {
  const eventLinkParts = event.link.split('?');

  const query = eventLinkParts.length === 2 ? qs.parse(eventLinkParts[1]) : {};
  const link = eventLinkParts[0];

  const context = _.pick(listContext, ['index', 'total']);

  if (res.locals.defaultLang !== res.locals.lang) {
    context.lang = res.locals.lang;
  }

  const params = _.omit(req.query, ['aggregations']);

  if (Object.keys(params).length > 0) {
    context.params = params;
  }

  event.link = `${link}?${qs.stringify(
    Object.assign(query, { nc: stringifyContext(context) }),
  )}`;

  return event;
}

export default navigation;

export { applyContextLink, parseContext, stringifyContext };
