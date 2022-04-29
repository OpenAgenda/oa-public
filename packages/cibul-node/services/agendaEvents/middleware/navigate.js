'use strict';

const qs = require('qs');
const log = require('@openagenda/logs')('services/agendaEvents/middleware/navigate');

const PAGE_SIZE = 20;

function removeQueryPrefix(query, prefix = 'q.') {
  const result = {};

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (key.startsWith(prefix)) {
        result[key.slice(prefix.length)] = query[key];
      }
    }
  }

  return result;
}

function getRequestedAdminNav(nav, total, page, index) {
  const pos = (page - 1) * PAGE_SIZE + index;
  const nextPos = nav === 'prev' ? Math.max(0, pos - 1) : Math.min(total - 1, pos + 1);

  return {
    page: Math.floor((nextPos + 1) % PAGE_SIZE !== 0 ? (nextPos + 1) / PAGE_SIZE + 1 : (nextPos + 1) / PAGE_SIZE),
    index: nextPos % PAGE_SIZE,
    first: nextPos === 0 || null,
    last: nextPos === total - 1 || null
  };
}

module.exports = async function navigate(req, res, next) {
  log('navigating');
  try {
    const { agenda } = req;
    const { core } = req.app.services;

    const {
      nav,
      admin_nav: dirtyAdminNav,
      ...restQuery
    } = req.query;
    const {
      page: pageStr,
      index: indexStr,
      first,
      last,
      ...adminNav
    } = dirtyAdminNav;
    const page = parseInt(pageStr, 10) || 1;
    const index = parseInt(indexStr, 10) || 0;
    const pos = (page - 1) * PAGE_SIZE + index;
    const query = removeQueryPrefix(adminNav);

    const { total, events } = await core
      .agendas(req.agenda.uid)
      .events.search({
        state: null,
        ...query
      }, {
        from: nav === 'prev' ? pos - 1 : pos + 1,
        size: 1
      }, {
        ...query,
        userUid: req.user.uid
      });

    const queryString = qs.stringify({
      ...restQuery,
      admin_nav: {
        ...adminNav,
        ...getRequestedAdminNav(nav, total, page, index)
      }
    }, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
      skipNulls: true,
    });

    if (!events.length) {
      next({ code : 404 });
    }

    log('redirecting to %s event %s', nav, events[0].slug);

    res.redirect(`/${agenda.slug}/events/${events[0].slug}${queryString}`);
  } catch (e) {
    next(e);
  }
}
