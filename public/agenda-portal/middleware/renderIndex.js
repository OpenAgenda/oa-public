'use strict';

const React = require('react');
const ReactDOM = require('react-dom/server');
const _ = require('lodash');
const { PortalContext } = require('@stefanoruth/react-portal-ssr');
const { PortalServer } = require('@stefanoruth/react-portal-ssr/server');
const FiltersRoot = require('../client/components/FiltersRoot');
const Provider = require('../client/components/Provider');

const setPageProp = require('../lib/utils/setPageProp');

function withProvider(req, res, children) {
  const messages = res.locals.widgets.reduce((accu, widget) => (widget.name === 'total' && widget.message
    ? Object.assign(accu, { [widget.message.id]: widget.message.defaultMessage })
    : accu), {});

  return React.createElement(Provider, {
    lang: res.locals.lang,
    initialValues: _.omit(req.query, 'sort'),
    onFilterChange: () => {},
    messages
  }, children);
}

module.exports = async (req, res, next) => {
  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(_.assign(req.data, req.app.locals));
  }

  setPageProp(req, 'pageType', 'list');
  setPageProp(req, 'lang', res.locals.lang);
  setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
  setPageProp(req, 'aggregations', req.data.aggregations);
  setPageProp(req, 'total', req.data.total);

  // Render filters
  const portal = new PortalServer(PortalContext);

  const elem = React.createElement(FiltersRoot, {
    filters: res.locals.filters,
    widgets: res.locals.widgets,
    initialAggregations: req.data.aggregations,
    initialTotal: req.data.total
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
