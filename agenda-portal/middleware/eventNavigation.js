'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const qs = require('qs');
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

  const context = navigation.parseContext(req.query.nc)

  const { search, index, lang } = context;

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
      const update = {
        total: { $set: total },
        index: { $set: newIndex }
      };

      const updatedContext = navigation.stringifyContext(ih(context, update));

      const queryPart = {
        nc: updatedContext
      };

      if (lang) {
        queryPart.lang = lang;
      }

      res.redirect(
        302,
        `${req.app.locals.root}/events/${
          _.first(events).slug
        }?${qs.stringify(queryPart)}`
      );
    }, next);
}

/**
 * set navigation links and info in template data
 */

function navigationLinks(req, res, next) {
  Object.assign(req.data, {
    navigation: navigation(req.app.locals, req.query.nc)
  });

  next();
}

module.exports = {
  redirectToNeighbor,
  navigationLinks
};
