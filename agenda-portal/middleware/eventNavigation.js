import _ from 'lodash';
import ih from 'immutability-helper';
import qs from 'qs';
import * as navigation from '../lib/eventNavigation.js';

/**
 * redirect to event neighbor
 */
function redirectToNeighbor(req, res, next) {
  const direction = _.get(req, 'params.direction', 'next');

  if (!['previous', 'next'].includes(direction)) {
    res.status(404);

    return next();
  }

  if (!req.query.nc) {
    res.status(404);

    return next();
  }

  const context = navigation.parseContext(req.query.nc);

  const { index, lang, params } = context;

  const newIndex = index + (direction === 'next' ? 1 : -1);

  req.app
    .get('proxy')
    .list(
      res.locals.agendaUid,
      {
        ...params,
        offset: Math.max(0, newIndex),
      },
      1,
    )
    .then(({ total, events }) => {
      const update = {
        total: { $set: total },
        index: { $set: newIndex },
      };

      const updatedContext = navigation.stringifyContext(ih(context, update));

      const queryPart = {
        nc: updatedContext,
      };

      if (lang) {
        queryPart.lang = lang;
      }

      if (!events.length) {
        res.redirect(302, `${req.app.locals.root}?${qs.stringify(params)}`);
        return;
      }

      res.redirect(
        302,
        `${req.app.locals.root}/events/${_.first(events).slug}?${qs.stringify(
          queryPart,
        )}`,
      );
    }, next);
}

/**
 * set navigation links and info in template data
 */

function navigationLinks(req, res, next) {
  Object.assign(req.data, {
    navigation: navigation.default(req.app.locals, req.query.nc),
  });

  next();
}

export { redirectToNeighbor, navigationLinks };
