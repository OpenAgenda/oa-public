'use strict';

const _ = require('lodash');
const qs = require('qs');
const { filtersToAggregations } = require('@openagenda/react-filters');
const paginate = require('../lib/paginate');

module.exports = withAggs => async (req, res, next) => {
  const proxy = req.app.get('proxy');
  const transform = req.app.get('transforms').event.listItem;
  const { filters, agendaUid } = res.locals;

  try {
    let filtersBase;

    if (withAggs) {
      filtersBase = (await proxy.list(
        agendaUid,
        {
          aggregations: filtersToAggregations(filters, true),
          limit: 0
        }
      )).aggregations;
    }

    const {
      total,
      offset,
      limit,
      events,
      aggregations
    } = await proxy
      .list(
        agendaUid,
        {
          aggregations: withAggs ? filtersToAggregations(filters) : undefined,
          ...req.query,
          page: parseInt(_.get(req, 'params.page', 1), 10)
        }
      );

    const pages = paginate({
      offset,
      limit,
      total,
    });

    req.data = _.assign(req.data || {}, {
      query: req.query,
      searchString: qs.stringify(req.query, { addQueryPrefix: true }),
      total,
      events: events.map((e, index) => transform(e, req, res, {
        total,
        index: offset + index,
      })),
      aggregations,
      pages,
      hasPages: pages.length > 1,
      filtersBase
    });

    next();
  } catch (err) {
    next(err);
  }
};
