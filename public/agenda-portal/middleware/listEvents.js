'use strict';

const _ = require('lodash');
const qs = require('qs');
const paginate = require('../lib/paginate');

module.exports = withAggregations => (req, res, next) => {
  const transform = req.app.get('transforms').event.listItem;

  const aggs = withAggregations
    ? res.locals.filters
      .map(filter => {
        if (filter.aggregation === null) {
          return false;
        }

        return {
          key: filter.name,
          type: filter.name,
          ...filter.aggregation,
        };
      })
      .filter(Boolean)
    : undefined;

  const needViewport = res.locals.filters.some(filter => filter.type === 'map');

  if (withAggregations && needViewport) {
    aggs.unshift({
      key: 'viewport',
      type: 'viewport'
    });
  }

  req.app
    .get('proxy')
    .list(
      res.locals.agendaUid,
      _.assign({
        aggregations: aggs
      }, req.query, {
        page: parseInt(_.get(req, 'params.page', 1), 10),
      })
    )
    .then(({
      total,
      offset,
      limit,
      events,
      aggregations
    }) => {
      const pages = paginate({
        offset,
        limit,
        total,
      });

      req.data = _.assign(req.data || {}, {
        query: req.query,
        searchString: qs.stringify(req.query),
        total,
        events: events.map((e, index) => transform(e, req, res, {
          total,
          index: offset + index,
        })),
        aggregations,
        pages,
        hasPages: pages.length > 1,
      });

      next();
    }, next);
};
