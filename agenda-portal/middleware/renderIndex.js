import React from 'react';
import ReactDOM from 'react-dom/server';
import _ from 'lodash';
import {
  PortalServer,
  PortalContext,
} from '@openagenda/react-portal-ssr/server';
import { FiltersProvider, FiltersManager } from '@openagenda/react-filters';
import setPageProp from '../lib/utils/setPageProp.js';

function withProvider(req, res, children) {
  const { intl } = res.locals;

  return React.createElement(
    FiltersProvider,
    {
      intl,
      filters: res.locals.filters,
      widgets: res.locals.widgets,
      initialValues: _.omit(req.query, 'sort'),
      onSubmit: () => {},
    },
    children,
  );
}

export default async (req, res, next) => {
  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(_.assign(req.data, req.app.locals));
  }

  const { intl } = res.locals;

  setPageProp(req, 'pageType', 'list');
  setPageProp(req, 'lang', res.locals.lang);
  setPageProp(req, 'locales', { [res.locals.lang]: intl.messages });
  setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
  setPageProp(req, 'agendaUid', res.locals.agenda.uid);
  setPageProp(req, 'manualSubmit', res.locals.manualSubmit);
  setPageProp(req, 'filtersFormSelector', res.locals.filtersFormSelector);
  setPageProp(req, 'aggregations', req.data.aggregations);
  setPageProp(req, 'total', req.data.total);
  setPageProp(req, 'filtersBase', req.data.filtersBase);

  if (req.app.locals.tracking?.useAgendaGoogleAnalytics) {
    const gaId = res.locals.agenda.settings.tracking?.googleAnalytics || null;
    if (!gaId) {
      console.log(
        'Warning: no Google Analytics ID found. Set one in your agenda settings or disable tracking.',
      );
    }
    const { cookieBannerLink, requireConsent } = req.app.locals.tracking;
    setPageProp(req, 'gaId', gaId);
    setPageProp(req, 'cookieBannerLink', cookieBannerLink);
    setPageProp(req, 'requireConsent', requireConsent);
  }

  // Render filters
  const portal = new PortalServer(PortalContext);

  const elem = React.createElement(FiltersManager, {
    defaultViewport: res.locals.agenda.summary.viewport,
    agendaUid: res.locals.agenda.uid,
    aggregations: req.data.aggregations,
    total: req.data.total,
    filtersBase: req.data.filtersBase,
    query: req.query,
  });

  ReactDOM.renderToString(portal.collectPortals(withProvider(req, res, elem)));

  portal.portals = portal.portals.map(({ content, selector }) => ({
    selector,
    content: withProvider(req, res, content),
  }));

  // Render index with filters
  res.render('index', req.data, (err, str) => {
    if (err) return next(err);
    res.send(portal.appendPortals(str));
  });
};
