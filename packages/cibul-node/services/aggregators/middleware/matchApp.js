'use strict';

const { parsePath } = require('history');
const React = require('react');
const ReactDOM = require('react-dom/server');

const createApp  = require('@openagenda/aggregator-sources/dist/client/app');
const wrapApp = require('@openagenda/react-utils/dist/wrapApp');

const layout = require('../../lib/layouts').load('agendaAdmin', {
  selectedTab: 'sources'
});

module.exports = async (config, req, res, next) => {
  const prefix = `/${req.params.agendaSlug}/admin/sources`;
  const lang = req.lang || 'fr';
  const staticContext = {};

  const initialState = {
    settings: {
      prefix,
      lang,
      apiRoot: `http://localhost:${config.port}`,
      perPageLimit: 20
    },
    res: {
      list: `/${req.params.agendaSlug}/admin/sources/agenda-sources.json`,
      show: req.genUrl( 'agendaShow', { slug: ':agendaSlug' } ).split( '?' )[ 0 ],
      remove: `/${req.params.agendaSlug}/admin/sources/remove`,
      search: req.genUrl( 'agendaSearch' ).split( '?' )[ 0 ],
      createAggregator: req.genUrl( 'aggregatorCreate', { uid: ':uid' } ).split( '?' )[ 0 ]
    },
    agenda: {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      isAggregator: req.isAggregator
    }
  };

  const reactApp = createApp( {
    req,
    initialState
  } );

  const { triggerHooks, store, history } = reactApp;

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString(wrapApp(reactApp));

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if (staticContext.status === 404) {
      return next();
    }

    if (staticContext.url) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname } = history.location;
    if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
      return res.redirect( 302, pathname );
    }

    return res.send(layout(`<div class="js_canvas">${content}</div>`, {
      lang: req.lang,
      agenda: req.agenda,
      role: req.member.role,
      bodyAttributes: [{
        name: 'data-options',
        value: JSON.stringify({ initialState: state })
      }],
      scripts: {
        bottom: [ { src: '/js/aggregatorSourcesIndex.js' } ]
      }
    }));

  } catch (e) {
    next(e);
  }
}
