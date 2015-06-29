"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'agenda/emailstrategie' ),

agendaSvc = require( '../services/agenda' ),

utils = require( '../lib/utils' ),

routes = {
  emailStrategieNew: [ 'get', '/new', newShow ],
  emailStrategieNewSubmit: [ 'post', '/new', newSubmit ],
  emailStrategieShow: [ 'get', '/', show ],
  emailStrategieSync: [ 'get', '/sync', sync ],
  emailStrategieUnlink: [ 'get', '/unlink', unlink ]
};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadAgenda( 'slug' ),
    cmn.checkAdministrator,
    cmn.checkCredential( 'emailstrategie' ),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
  ]);

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function sync( req, res, next ) {

  req.agenda.emailStrategie.syncEvents( true, function( err ) {

    if ( err ) return next( err );

    res.redirect( 302, req.genUrl( 'emailStrategieShow', { slug: req.agenda.slug } ) );

  });

}

function newShow( req, res, next ) {

  req.agenda.emailStrategie.getAccount( function( err, account ) {

    if ( err ) return next( err );

    if ( account ) return res.redirect( 302, req.genUrl( 'emailStrategieShow', { slug: req.agenda.slug } ) );

    cmn.render( req, res, 'emailStrategie/new', {
      values: {
        login: '',
        password: ''
      }
    });

  });

}

function newSubmit( req, res, next ) {

  req.agenda.emailStrategie.setAccountList(
    req.body.login,
    req.body.password,
    function( err, result ) {

      if ( err ) return next( err );

      if ( !result ) {

        cmn.render( req, res, 'emailStrategie/new', {
          values: {
            login: req.body.login,
            password: ''
          },
          error: 'Authentication attempt failed'
        });

      } else {

        res.redirect( 302, req.genUrl( 'emailStrategieShow', { slug: req.agenda.slug } ) );

      }

    } );

}

function show( req, res, next ) {

  req.agenda.emailStrategie.getState( function( err, obj ) {

    if ( err ) return next( err );

    if ( !obj || !obj.account ) {

      return res.redirect( 302, req.genUrl( 'emailStrategieNew', { slug: req.agenda.slug } ) );

    }

    if ( !obj.list ) {

      req.log( 'info', 'did not retrieve any list reference. Redirecting to unlink' );

      return res.redirect( 302, req.genUrl( 'emailStrategieUnlink', { slug: req.agenda.slug } ) );      

    }

    cmn.render( req, res, 'emailStrategie/index', {
      accountName : obj.account.login,
      listName : obj.list.name,
      state : "Ok",
      error : obj.error,
      agendaCount: obj.agendaCount,
      emailStrategieCount: obj.emailStrategieCount
    } );

  });

}

function unlink( req, res, next ) {

  req.log( 'info', 'unlinking account for agenda %s', req.agenda.slug );

  req.agenda.emailStrategie.removeAccount( function( err ) {

    if ( err ) return next( err );

    res.redirect( 302, req.genUrl( 'emailStrategieNew', { slug: req.agenda.slug } ) );

  });

}