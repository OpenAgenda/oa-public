"use strict";

const cmn = require( '../lib/commons-app' );

const legacyAgendaSvc = require( '../services/agenda' );
const members = require('../services/members');

const preMw = [
  legacyAgendaSvc.mw.load('slug'),
  members.mw.loadAndAuthorize('administrator'),
  cmn.checkCredential('emailstrategie'),
  legacyAgendaSvc.mw.loadAdminLayout,
  cmn.loadBaseData()
];


module.exports = app => {

  app.get( '/:slug/admin/emailstrategie/new', preMw, newShow );

  app.post( '/:slug/admin/emailstrategie/new', preMw, newSubmit );

  app.get( '/:slug/admin/emailstrategie', preMw, show );

  app.post( '/:slug/admin/emailstrategie/push', preMw, push );

  app.get( '/:slug/admin/emailstrategie/unlink', preMw, unlink );

}

function push( req, res, next ) {

  const fields = [];
  const filters = [];
  let i;

  for( i in req.body.fields ) {

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
