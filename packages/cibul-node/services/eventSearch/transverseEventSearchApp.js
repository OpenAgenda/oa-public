'use strict';

const express = require('express');
const log = require('@openagenda/logs')('services/eventSearch/plugApp');

const baseAggregations = [
  'agendas',
  'keywords',
  'timingsByMonth',
  'location.region',
  'location.city',
  'location.name',
];

module.exports = services => {
  const app = express.Router();

  app.get('/*', (req, res, next) => {
    req.search = {
      options: {},
      nav: {
        size: 0,
        offset: 0
      },
      query: {}
    };
    next();
  });

  app.get('/', (req, res, next) => {
    if (req.query.aggs) {
      req.search.options.aggregations = [].concat(baseAggregations);
    }
    req.search.nav.size = 10;
    next();
  });

  app.get('/aggs', (req, res, next) => {
    req.search.options.aggregations = [].concat(baseAggregations);
    next();
  });

  app.get('/cal', (req, res, next) => {
    req.search.options.aggregations = ['eventsByDay'].concat(baseAggregations);
  });

  app.get(['/', '/cal', '/aggs'], (req, res, next) => {
    services.eventSearch.transverse.search(
      req.search.options,
      req.search.nav,
      req.search.options
    ).then(result => res.json(result));
  });

  app.get('/rebuild', (req, res, next) => {
    services.eventSearch.transverse.rebuild({
      stopAtCount: req.query.stop || null
    });
    res.redirect(302, app.path() + '/rebuilding');
  });

  app.get('/rebuilding', (req, res, next) => res.send('rebuilding'));

  return app;
}
