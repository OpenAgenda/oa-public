"use strict";

var config = require( '../config' ),

  log = require( 'logger' )( 'admin/agendas.back' ),

  modLib = require( "../lib/moduleLib.js" ),

  cmn = require( '../lib/commons-app' ),

  bodyParser = require( 'body-parser' ),

  moment = require( "moment" ),

  mw = require( 'admin-agendas' ).mw,

  routes = {
    adminAgendasIndex: [ 'get', '/', index ],
    adminAgendasSearchRes: [ 'get', '/search', mw.agendas.list ],
    adminAgendasGetRes: [ 'get', '/get', mw.agendas.get ],
    adminAgendasSetRes: [ 'post', '/:uid', [ bodyParser.json(), mw.agendas.set ] ],
    adminAgendasStakeholdersSearchRes: [ 'get', '/stakeholders/search', mw.stakeholders.list ]
  };


module.exports = function( path ) {

  var router = modLib.Router( routes );

  moment.locale( 'fr' );

  router.pre( [
    cmn.flashSetter,
    cmn.loadBaseData( 'compiledAdmin.css' ),
    cmn.loadSession,
    cmn.requireLogged(),
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