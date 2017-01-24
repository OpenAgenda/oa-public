"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

al = require( 'agenda-locations' ),

routes = {

  locationShow: [ 'get', '/:locationUid.json', [
    al.mw.get,
    ( req, res ) => cmn.renderJson( req, res, req.location )
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'location front' ),
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}