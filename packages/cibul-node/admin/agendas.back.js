"use strict";

const log = require( '@openagenda/logs' )( 'admin/agendas.back' );

var config = require( '../config' ),

  modLib = require( '../lib/moduleLib.js' ),

  cmn = require( '../lib/commons-app' ),

  bodyParser = require( 'body-parser' ),

  moment = require( 'moment' ),

  sessions = require( '@openagenda/sessions' ),

  mw = require( '@openagenda/admin-agendas' ).mw,

  routes = {
    adminAgendasIndex: [ 'get', '/', index ],
    adminAgendasSearchRes: [ 'get', '/search', mw.agendas.list ],
    adminAgendasGetRes: [ 'get', '/get', mw.agendas.get ],
    adminAgendasSetRes: [ 'post', '/:uid', [
      bodyParser.json(),
      ( req, res, next ) => {
        req.context = { user: req.user };
        next();
      },
      mw.agendas.set
    ] ],
    adminAgendasStakeholdersSearchRes: [ 'get', '/stakeholders/search', [
      ( req, res, next ) => {

        req.query.agendaId = req.query.agendaId ? parseInt( req.query.agendaId ) : null;

        req.query.order = 'credential';

        next();

      },
      mw.stakeholders.list
    ] ]
  };


module.exports = function ( path ) {

  var router = modLib.Router( routes );

  moment.locale( 'fr' );

  router.pre( [
    cmn.loadBaseData( 'compiledAdmin.css' ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    sessions.middleware.load(),
    cmn.requireAdmin
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


function index( req, res ) {

  cmn.render( req, res, 'admin/agendas', req.templateData );

}
