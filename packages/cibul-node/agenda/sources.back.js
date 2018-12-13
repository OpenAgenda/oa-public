"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const aggregatorSourcesSvc = require( '@openagenda/aggregator-sources' );
const aggregatorSvc = require( '../services/aggregator' );
const agendaSvc = require( '../services/agenda' );
const mw = aggregatorSourcesSvc.mw;
const sessions = require( '@openagenda/sessions' );


const routes = {

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
  ] ],

  /**********/

  aggregatorSourcesList: [ 'get', '/sources/agenda-sources.json', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.list
  ] ],

  aggregatorSourcesRemove: [ 'get', '/sources/remove', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.remove
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'aggregatorSources' ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() )
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

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';
  const tab = 'sources';

  cmn.render( req, res, 'aggregatorSources/index', { scriptParams: { state }, lang, content, tab } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'aggregatorSourcesApp', { slug: req.params.slug } ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  mw.matchApp(
    {
      state: {
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
    },
    prefix,
    getApp
  )( req, res, next );

}
