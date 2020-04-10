'use strict';

const _ = require('lodash');
const qs = require('qs');
const b64 = require('./utils/base64');

function stringifyContext(obj) {
  return b64.encode(JSON.stringify(obj));
}

function parseContext(str) {
  return JSON.parse(b64.decode(str));
}

function _listLink({ root, eventsPerPage }, context) {
  const page = Math.ceil((context.index + 1) / eventsPerPage);

  let queryString = '';

  if (context.search) {
    queryString = `?${qs.stringify(_.set({}, 'oaq', context.search))}`;
  }

  return `${root}${page > 1 ? `/p/${page}` : ''}${queryString}`;
}

function navigation({ root, eventsPerPage }, contextStr) {
  const nav = {
    list: root,
    previous: null,
    next: null,
    total: null,
    position: null,
    available: false
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

  return _.assign(nav, _.pick(context, ['total', 'offset']));
}

function applyContextLink({ req, context }, event) {
  const eventLinkParts = event.link.split('?');

  const query = eventLinkParts.length === 2 ? qs.parse(eventLinkParts[1]) : {};
  const link = eventLinkParts[0];

  event.link = `${link}?${qs.stringify(
    _.assign(query, {
      nc: stringifyContext(
        _.assign(
          _.pick(context, ['index', 'total']),
          req.query.oaq ? { search: req.query.oaq } : {}
        )
      )
    })
  )}`;

  return event;
}

module.exports = _.assign(navigation, {
  applyContextLink,
  parseContext,
  stringifyContext
});
