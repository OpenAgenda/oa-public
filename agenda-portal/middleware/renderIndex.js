'use strict';

const React = require('react');
const ReactDOM = require('react-dom/server');
const _ = require('lodash');
const { PortalServer, PortalContext } = require('@openagenda/react-portal-ssr/server');
const { FiltersProvider, FiltersManager } = require('@openagenda/react-filters');

const setPageProp = require('../lib/utils/setPageProp');

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

  const { intl } = res.locals;

  setPageProp(req, 'pageType', 'list');
  setPageProp(req, 'lang', res.locals.lang);
  setPageProp(req, 'locales', { [res.locals.lang]: intl.messages });
  setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
  setPageProp(req, 'agendaUid', res.locals.agenda.uid);
  setPageProp(req, 'aggregations', req.data.aggregations);
  setPageProp(req, 'total', req.data.total);
  setPageProp(req, 'filtersBase', req.data.filtersBase);

  if (req.app.locals.tracking.useAgendaGoogleAnalytics) {
    const gaId = res.locals.agenda.settings.tracking?.googleAnalytics || null;
    if (!gaId) console.log('Warning: no Google Analytics ID found. Set one in your agenda settings or disable tracking.');
    const { cookieBannerLink } = req.app.locals.tracking;
    setPageProp(req, 'gaId', gaId);
    setPageProp(req, 'cookieBannerLink', cookieBannerLink);
  }

  // Render filters
  const portal = new PortalServer(PortalContext);

  const elem = React.createElement(FiltersManager, {
    filters: res.locals.filters,
    widgets: res.locals.widgets,
    defaultViewport: res.locals.agenda.summary.viewport,
    agendaUid: res.locals.agenda.uid,
    aggregations: req.data.aggregations,
    total: req.data.total,
    filtersBase: req.data.filtersBase,
    query: req.query
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
