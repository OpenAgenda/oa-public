"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

locationSvc = require( '../services/location' ),

routes = {

  locationShow: [ 'get', '/:uid.json', [
    locationSvc.mw.load( 'uid', 'uid' ),
    show
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'location front' ),
    cmn.flashSetter,
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function show( req, res ) {

  var l = req.location;

  cmn.renderJson( req, res, {
    name: l.placename,
    address: l.address,
    city: l.city,
    district: l.cityDistrict,
    latitude: l.latitude,
    longitude: l.longitude,
    postalCode: l.postalCode,
    department: l.department,
    region: l.region
  });

}