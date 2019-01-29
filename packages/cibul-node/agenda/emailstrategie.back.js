"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

agendaSvc = require( '../services/agenda' ),

routes = {
  emailStrategieNew: [ 'get', '/new', newShow ],
  emailStrategieNewSubmit: [ 'post', '/new', newSubmit ],
  emailStrategieShow: [ 'get', '/', show ],
  emailStrategiePush: [ 'post', '/push', push ],
  emailStrategieUnlink: [ 'get', '/unlink', unlink ]
};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    cmn.checkCredential( 'emailstrategie' ),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData()
  ]);

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function push( req, res, next ) {

  var fields = [],

  filters = [];

  for( var i in req.body.fields ) {

    fields.push( i );

  }

  for( i in req.body.filters ? req.body.filters : {} ) {

    filters.push( i );

  }

  req.agenda.emailStrategie.pushEvents( {
    fields: fields,
    filters: filters,
    useExternalUrl: !!req.body.url
  }, function( err ) {

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

  req.agenda.emailStrategie.setAccount(
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

        res.redirect( 302, req.genUrl( 'emailStrategieShow', {
          slug: req.agenda.slug
        } ) );

      }

    } );

}

function show( req, res, next ) {

  req.agenda.emailStrategie.getState( function( err, obj ) {

    if ( err ) return next( err );

    if ( !obj || !obj.account ) {

      return res.redirect( 302, req.genUrl( 'emailStrategieNew', { slug: req.agenda.slug } ) );

    }

    cmn.render( req, res, 'emailStrategie/index', {
      accountName : obj.account.login,
      list : obj.list || false,
      state : obj.state,
      fields: obj.fields,
      error : obj.error,
      agendaCount: obj.agendaCount,
      emailStrategieCount: obj.emailStrategieCount,
      url: obj.url
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
