"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const bodyParser = require( 'body-parser' );
const stakeholdersSvc = require( 'agenda-stakeholders' );
const mw = require( 'member-apps/middleware' )( stakeholdersSvc, { limit: 20 } );
const agendaSvc = require( '../services/agenda' );


const routes = {

  membersApp: [ 'get', '/members', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  ] ],

  membersSub: [ 'get', '/members/?*?', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  ] ],

  /**********/

  membersList: [ 'get', '/members/stakeholders.json', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.list
  ] ],

  membersStats: [ 'get', '/members/stats', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    mw.stats
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'members' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged(),
    bodyParser.json()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};


function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';
  const tab = 'members';

  cmn.render( req, res, 'members/index', { scriptParams: { state }, lang, content, tab } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'membersApp', { slug: req.params.slug } ).split( '?' )[ 0 ];
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
          list: req.genUrl( 'membersList', { slug: req.agenda.slug } ),
          stats: req.genUrl( 'membersStats', { slug: req.agenda.slug } ),
          showContributor: req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug }) + '?contributorUid=:contributorUid'
        },
        agenda: {
          uid: req.agenda.uid,
          slug: req.agenda.slug,
          title: req.agenda.title
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}