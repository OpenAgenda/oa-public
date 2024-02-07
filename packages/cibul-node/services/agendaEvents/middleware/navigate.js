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

function getRequestedNc(nav, total, page, index) {
  const pos = (page - 1) * PAGE_SIZE + index;
  const newPos = nav === 'prev' ? Math.max(0, pos - 1) : Math.min(total - 1, pos + 1);

  return {
    page: Math.floor((newPos + 1) % PAGE_SIZE !== 0 ? (newPos + 1) / PAGE_SIZE + 1 : (newPos + 1) / PAGE_SIZE),
    index: newPos % PAGE_SIZE,
    first: newPos === 0 || null,
    last: newPos === total - 1 || null,
  };
}

module.exports = async function navigate(req, res, next) {
  log('navigating');
  try {
    const { agenda } = req;
    const { core } = req.app.services;

    const {
      nav,
      nc: dirtyNc,
      ...restQuery
    } = req.query;
    const {
      page: pageStr,
      index: indexStr,
      first,
      last,
      ...nc
    } = dirtyNc;
    const page = parseInt(pageStr, 10) || 1;
    const index = parseInt(indexStr, 10) || 0;
    const pos = (page - 1) * PAGE_SIZE + index;
    const query = removeQueryPrefix(nc);

    const from = nav === 'prev' ? pos - 1 : pos + 1;

    const { total, events } = await core
      .agendas(req.agenda.uid)
      .events.search({
        state: null,
        ...query,
      }, {
        from,
        size: nav === 'next' ? 2 : 1, // need 2 for isLast
      }, {
        ...query,
        userUid: req.user.uid,
        includeFields: ['uid', 'slug'],
      });

    const queryString = qs.stringify({
      ...restQuery,
      nc: {
        ...nc,
        ...getRequestedNc(nav, total, page, index),
      },
    }, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
      skipNulls: true,
    });

    if (!events.length) {
      next({ code: 404 });
    }

    if (req.accepts(['html', 'json']) === 'json') {
      res.json({
        event: events[0],
        isLast: nav === 'next' && events.length < 2,
        isFirst: from === 0,
      });
      return;
    }

    log('redirecting to %s event %s', nav, events[0].slug);

    res.redirect(`/${agenda.slug}/events/${events[0].slug}${queryString}`);
  } catch (e) {
    next(e);
  }
};
