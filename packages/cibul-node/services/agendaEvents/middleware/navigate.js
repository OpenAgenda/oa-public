import qs from 'qs';
import logs from '@openagenda/logs';

const log = logs('services/agendaEvents/middleware/navigate');

function getRequestedNc(nav, total, from) {
  const newPos = Math.max(from, Math.min(total - 1, from));

  return {
    from: newPos,
    first: newPos === 0 || null,
    last: newPos === total - 1 || null,
  };
}

export default async function navigate(req, res, next) {
  log('navigating');
  try {
    const { agenda } = req;
    const { core } = req.app.services;

    const { nav, nc: dirtyNc, ...restQuery } = req.query;
    const { from: pos, first, last, ...query } = dirtyNc;

    const from = nav === 'prev' ? parseInt(pos, 10) - 1 : parseInt(pos, 10) + 1;

    const { total, events } = await core.agendas(req.agenda.uid).events.search(
      query,
      {
        from,
        size: 1,
      },
      {
        ...query,
        userUid: req.user?.uid,
        includeFields: ['uid', 'slug'],
      },
    );

    if (!events.length) {
      next({ code: 404 });
      return;
    }

    if (req.accepts(['html', 'json']) === 'json') {
      res.json({
        event: events[0],
        // Compute from the target index relative to `total` so both flags
        // are symmetric across nav directions and robust to edge cases
        // (negative `from`, off-by-one, repeated round-trips).
        isFirst: from <= 0,
        isLast: from >= total - 1,
      });
      return;
    }

    log('redirecting to %s event %s', nav, events[0]?.slug);

    const queryString = qs.stringify(
      {
        ...restQuery,
        nc: {
          ...query,
          ...getRequestedNc(nav, total, from),
        },
      },
      {
        addQueryPrefix: true,
        arrayFormat: 'brackets',
        skipNulls: true,
      },
    );

    res.redirect(`/${agenda.slug}/events/${events[0].slug}${queryString}`);
  } catch (e) {
    next(e);
  }
}
