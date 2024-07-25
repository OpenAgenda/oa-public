/* eslint-disable no-param-reassign */

import _ from 'lodash';
import moment from 'moment';
import async from 'async';
import config from '../../config/index.js';
import model from '../model/index.js';
import es from './es.js';

/**
 *
 * get stats info on indexed events: updated events aggregated
 * over weeks
 *
 */

export function getIndexedEventsByWeek(options, cb) {
  const params = {
    year: new Date().getFullYear(),
  };

  if (!cb) {
    cb = options;
    options = {};
  }

  _.merge(params, options);

  const dsl = {
    query: {
      bool: {
        should: [{
          term: {
            original_es: true,
          },
        }, {
          range: {
            updatedAt: {
              gte: `${params.year}-01-01T00:00:00.000Z`,
            },
          },
        }],
        minimum_should_match: 2,
      },
    },
    aggs: {
      histogram: {
        date_histogram: {
          field: 'updatedAt',
          interval: 'week',
        },
      },
    },
  };

  es(config.es, 'event', dsl, (err, data) => {
    if (err) return cb(err);

    cb(null, data.aggregations.histogram.buckets.map(d => ({
      l: moment(d.key_as_string).format('DD MMM'),
      v: d.doc_count,
    })));
  });
}

/**
 * get difference count between db and search index
 */

export function getIndexDiff(cb) {
  let dbCount;

  const unreferencedQuery = [
    'select count( * ) as unref_count from( ',
    'select e.id',
    'from event as e left join review_article as ra on ra.event_id=e.id and ra.state=2',
    'where e.is_published = 1 and e.is_new = 0',
    'group by e.id having count( ra.id ) = 0',
    ') as x',
  ].join(' ');

  const referencedQuery = [
    'select count(ra.id) as ref_count',
    'from review_article as ra',
    'where ra.state = 2',
  ].join(' ');

  async.map([unreferencedQuery, referencedQuery], model.lib.query, (err, results) => {
    if (err) return cb(err);

    dbCount = results[0][0].unref_count + results[1][0].ref_count;

    // total es result for events should be same.

    es(config.es, 'event', (err2, result) => {
      if (err2) return cb(err2);

      cb(null, dbCount - result.hits.total);
    });
  });
}
