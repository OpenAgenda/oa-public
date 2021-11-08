'use strict';

const React = require('react');
const ReactDOM = require('react-dom/server');
const _ = require('lodash');
const { PortalContext } = require('@stefanoruth/react-portal-ssr');
const { PortalServer } = require('@stefanoruth/react-portal-ssr/server');
const { FiltersProvider, FiltersManager } = require('@openagenda/react-filters');

const setPageProp = require('../lib/utils/setPageProp');
const Input = require('../client/components/Input');

function withProvider(req, res, children) {
  const { intl } = res.locals;

  return React.createElement(FiltersProvider, {
    intl,
    initialValues: _.omit(req.query, 'sort'),
    onSubmit: () => {}
  }, children);
}

module.exports = async (req, res, next) => {
  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(_.assign(req.data, req.app.locals));
  }

  setPageProp(req, 'pageType', 'list');
  setPageProp(req, 'lang', res.locals.lang);
  setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
  setPageProp(req, 'initialAggregations', req.data.aggregations);
  setPageProp(req, 'total', req.data.total);
  setPageProp(req, 'filtersBase', req.data.filtersBase);

  // Render filters
  const portal = new PortalServer(PortalContext);

  const elem = React.createElement(FiltersManager, {
    filters: res.locals.filters,
    widgets: res.locals.widgets,
    initialAggregations: req.data.aggregations,
    initialTotal: req.data.total,
    filtersBase: req.data.filtersBase,
    searchProps: {
      inputComponent: Input
    }
  });

  ReactDOM.renderToString(portal.collectPortals(withProvider(req, res, elem)));

  portal.portals = portal.portals.map(({ content, selector }) => ({
    selector,
    content: withProvider(req, res, content)
  }));

  // Render index with filters
  res.render('index', req.data, (err, str) => {
    if (err) return next(err);
    res.send(portal.appendPortals(str));
  });
};
