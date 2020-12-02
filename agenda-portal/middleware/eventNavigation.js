'use strict';

const _ = require('lodash');
const navigation = require('../lib/eventNavigation');

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

  const { search, index } = navigation.parseContext(req.query.nc);

  const newIndex = index + (direction === 'next' ? 1 : -1);

  req.app
    .get('proxy')
    .list(
      res.locals.agendaUid,
      _.assign(
        { oaq: search },
        {
          offset: Math.max(0, newIndex)
        }
      ),
      1
    )
    .then(({ total, events }) => {
      const updatedContext = navigation.stringifyContext({
        total,
        search,
        index: newIndex
      });

      res.redirect(
        302,
        `${req.app.locals.root}/events/${
          _.first(events).slug
        }?nc=${updatedContext}`
      );
    }, next);
}

/**
 * set navigation links and info in template data
 */

function navigationLinks(req, res, next) {
  _.assign(req.data, {
    navigation: navigation(req.app.locals, req.query.nc)
  });

  next();
}

module.exports = {
  redirectToNeighbor,
  navigationLinks
};
