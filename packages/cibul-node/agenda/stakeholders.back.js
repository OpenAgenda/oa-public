"use strict";

const validator = require( 'validator' );
const sessions = require( '@openagenda/sessions' );
const usersSvc = require( '@openagenda/users' );
const stakeholdersMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );
const getActionLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/actions' ) );
const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const eventSvc = require( '../services/event' );


module.exports = app => {

  app.get(
    '/:slug/admin/contributors/info',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    info
  );

  app.post(
    '/:slug/admin/contributors/info',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
    infoSubmit
  );

  app.get(
    '/:slug/admin/contributors/transfer/:eventSlug',
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _checkAdminOrModeratorOrEventOwner,
    cmn.checkCredential( 'eventTransfer' ),
    stakeholdersMw.agenda().load(),
    _loadUserByEmail,
    transfer
  );

  app.get(
    '/:slug/admin/contributors/:uid.json',
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdminOrModerator,
    _loadUserByUid,
    stakeholdersMw.agenda().get( { user: 'queriedUser' } ),
    ( req, res ) => {
      if ( !req.stakeholder ) {
        res.status( 404 ).send( 'Not found' );
      } else {
        res.json( { name: req.queriedUser.fullName } );
      }
    }
  );

};


function info( req, res ) {

  req.agenda.getContributionInfo( ( err, info ) => {

    cmn.render( req, res, 'contributors/info', {
      info
    } );

  } );

}


function infoSubmit( req, res ) {

  req.agenda.setContributionInfo( req.body.info, true, function ( err ) {

    if ( err ) return next( err );

    res.redirect( req.genUrl( 'contributorsInfo', { slug: req.agenda.slug } ) );

  } );

}


async function _loadUserByEmail( req, res, next ) {

  if ( !req.query.email || !validator.isEmail( req.query.email ) ) {

    return next( {
      code: 400,
      message: 'email is wrong or missing'
    } );

  }

  try {

    const user = await usersSvc.findOne( {
      query: { email: req.query.email }
    } );

    if ( !user ) {
      return next( { code: 400, message: 'the target account does not exist' } );
    }

    req.stakeholder = user;

    next();

  } catch ( err ) {

    return next( err );

  }

}


async function _loadUserByUid( req, res, next ) {

  try {

    req.queriedUser = await usersSvc.get( req.params.uid );

    next();

  } catch ( err ) {

    return next( err );

  }

}


function transfer( req, res, next ) {

  req.stakeholders.transferEvent( {
    event: { id: req.event.id },
    user: { id: req.stakeholder.id }
  }, err => {

    if ( err ) return next( err );

    // force ES update
    req.event.onSave();

    sessions.setFlash( req, res, getActionLabel( 'ownershipTransfered', req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    } ) );

  } );

}


function _checkAdminOrModeratorOrEventOwner( req, res, next ) {

  if ( req.event.ownerId === req.user.id ) {

    return next();

  }

  cmn.checkAdminOrModerator( req, res, result => {

    if ( result ) return next( result );

    req.event.getAdminAgendas( ( err, agendas ) => {

      let isAdminAgenda = !!agendas.map( a => a.uid ).filter( uid => uid === req.agenda.uid ).length;

      next( isAdminAgenda ? null : { code: 403 } );

    } );

  } );

}
