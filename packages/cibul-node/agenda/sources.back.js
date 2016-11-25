"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const bodyParser = require( 'body-parser' );
const aggregatorSourcesSvc = require( 'aggregator-sources' );
const agendaSvc = require( '../services/agenda' );
const mw = aggregatorSourcesSvc.mw;

module.exports = path => {

  const routes = {

    aggregatorSourcesApp: [ 'get', '/sources', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],

    aggregatorSourcesSub: [ 'get', '/sources/?*?', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
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

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'aggregatorSources' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged(),
    bodyParser.json()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

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
            show: req.genUrl( 'agendaShow', { slug: req.params.slug } ).split( '?' )[ 0 ],
            remove: req.genUrl( 'aggregatorSourcesRemove', { uid: ':uid' } ).split( '?' )[ 0 ],
            search: req.genUrl( 'agendaSearch' ).split( '?' )[ 0 ]
          },
          agenda: {
            slug: req.agenda.slug,
            title: req.agenda.title,
          }
        }
      },
      prefix,
      getApp
    )( req, res, next );

  }

};
