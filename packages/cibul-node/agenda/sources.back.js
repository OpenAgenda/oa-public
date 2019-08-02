"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );
const aggregatorSourcesSvc = require( '@openagenda/aggregator-sources' );
const createApp  = require( '@openagenda/aggregator-sources/dist/client/app' );
const aggregatorSvc = require( '../services/aggregator' );
const mw = aggregatorSourcesSvc.mw;
const sessions = require( '@openagenda/sessions' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'sources' }
);

const preMw = [
  cmn.loadLogger( 'aggregatorSources' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];


module.exports = app => {

  app.get(
    '/:slug/admin/sources/agenda-sources.json',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    mw.list
  );

  app.get(
    '/:slug/admin/sources/remove',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    mw.remove
  );

  app.get(
    '/:slug/admin/sources',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    populateIsAggregator,
    matchApp
  );

  app.get(
    '/:slug/admin/sources/?*?',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    populateIsAggregator,
    matchApp
  );

};


function populateIsAggregator( req, res, next ) {

  aggregatorSvc.isAggregator( req.agenda.id, ( err, isAggregator ) => {

    if ( err ) return next( err );

    req.isAggregator = isAggregator;
    next();

  } );

}

async function matchApp( req, res, next ) {

  const prefix = `/${req.params.slug}/admin/sources`;
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, staticContext, history } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: `/${req.params.slug}/admin/sources/agenda-sources.json`,
        show: req.genUrl( 'agendaShow', { slug: ':slug' } ).split( '?' )[ 0 ],
        remove: `/${req.params.slug}/admin/sources/remove`,
        search: req.genUrl( 'agendaSearch' ).split( '?' )[ 0 ],
        createAggregator: req.genUrl( 'aggregatorCreate', { uid: ':uid' } ).split( '?' )[ 0 ]
      },
      agenda: {
        uid: req.agenda.uid,
        slug: req.agenda.slug,
        title: req.agenda.title,
        isAggregator: req.isAggregator
      }
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname, search } = history.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 302, pathname );
    }

    return res.send( layout( `<div class="js_canvas">${content}</div>`, {
      lang: req.lang,
      agenda: req.agenda,
      role: req.role,
      bodyAttributes: [ {
        name: 'data-options',
        value: JSON.stringify( { initialState: state } )
      } ],
      scripts: {
        bottom: [ { src: '/js/aggregatorSourcesIndex.js' } ]
      }
    } ) );

  } catch ( e ) {
    next( e );
  }

}
