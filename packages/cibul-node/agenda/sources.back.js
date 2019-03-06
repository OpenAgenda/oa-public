"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const aggregatorSourcesSvc = require( '@openagenda/aggregator-sources' );
const createApp  = require( '@openagenda/aggregator-sources/dist/client/app' );
const aggregatorSvc = require( '../services/aggregator' );
const agendaSvc = require( '../services/agenda' );
const mw = aggregatorSourcesSvc.mw;
const sessions = require( '@openagenda/sessions' );


const routes = {

  aggregatorSourcesList: [ 'get', '/sources/agenda-sources.json', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.list
  ] ],

  aggregatorSourcesRemove: [ 'get', '/sources/remove', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.remove
  ] ],

  /**********/

  aggregatorSourcesApp: [ 'get', '/sources', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    populateIsAggregator,
    matchApp
  ] ],

  aggregatorSourcesSub: [ 'get', '/sources/?*?', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    populateIsAggregator,
    matchApp
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'aggregatorSources' ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};


function populateIsAggregator( req, res, next ) {

  aggregatorSvc.isAggregator( req.agenda.id, ( err, isAggregator ) => {

    if ( err ) return next( err );

    req.isAggregator = isAggregator;
    next();

  } );

}

async function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'aggregatorSourcesApp', { slug: req.params.slug } ).split( '?' )[ 0 ];
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
        list: req.genUrl( 'aggregatorSourcesList', { slug: req.params.slug } ).split( '?' )[ 0 ],
        show: req.genUrl( 'agendaShow', { slug: ':slug' } ).split( '?' )[ 0 ],
        remove: req.genUrl( 'aggregatorSourcesRemove', { slug: req.params.slug, uid: ':uid' } ).split( '?' )[ 0 ],
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

    cmn.render( req, res, 'aggregatorSources/index', {
      scriptParams: { initialState: state },
      preloaded: true,
      lang,
      content,
      tab: 'sources'
    } );
  } catch ( e ) {
    next( e );
  }

}
