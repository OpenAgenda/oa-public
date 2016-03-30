"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

invitationSvc = require( '../services/invitation' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

userSvc = require( '../services/user' ),

validator = require( 'validator' ),

stakeholders = require( 'agenda-stakeholders/middleware' ),

utils = require( '../lib/utils' ),

routes = {

  contributorsInvite:  [ 'post', '/contributors/invite', [ 
    cmn.checkAdminOrModerator,
    invite()
  ] ],

  administratorsInvite: [ 'post', '/admins/invite', [
    cmn.checkAdministrator(),
    invite( { inviteMethod: 'inviteAdministrators', redirect: 'agendaAdminAdministrators' } )
  ]],

  moderatorsInvite: [ 'post', '/moderators/invite', [
    cmn.checkAdministrator(),
    invite( { inviteMethod: 'inviteModerators', redirect: 'agendaAdminModerators' } )
  ]],

  contributorInviteResend: [ 'get', '/contributors/resend', [ 
    cmn.checkAdminOrModerator,
    inviteResend()
  ] ],

  administratorInviteResend: [ 'get', '/admins/resend', [
    cmn.checkAdministrator(),
    inviteResend( { inviteMethod: 'inviteAdministrators', redirect: 'agendaAdminAdministrators' } )
  ] ],

  moderatorsInviteResend: [ 'get', '/moderators/resend', [
    cmn.checkAdministrator(),
    inviteResend( { inviteMethod: 'inviteModerators', redirect: 'agendaAdminModerators' })
  ] ],

  contributorInviteResendAll: [ 'get', '/contributors/resendall', [ 
    cmn.checkAdminOrModerator,
    inviteResendAll()
  ] ],

  administratorInviteResendAll: [ 'get', '/admins/resendall', [
    cmn.checkAdministrator(),
    inviteResendAll( { inviteMethod: 'resendInviteAdministrators', redirect: 'agendaAdminAdministrators' } )
  ] ],

  moderatorsInviteResendAll: [ 'get', '/moderators/resendall', [
    cmn.checkAdministrator(),
    inviteResendAll( { inviteMethod: 'resendInviteModerators', redirect: 'agendaAdminModerators' })
  ] ],

  contributorsInfo: [ 'get', '/contributors/info', [ 
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
    info
  ] ],

  contributorsInfoSubmit: [ 'post', '/contributors/info', [
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
    infoSubmit
  ] ],

  eventTransfer: [ 'get', '/contributors/transfer/:eventSlug' , [
    cmn.checkAdminOrModerator,
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkCredential( 'eventTransfer' ),
    stakeholders.loadAgenda( 'agenda', 'stakeholders' ),
    _loadUserByEmail,
    transfer
  ] ]
  
};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    agendaSvc.mw.load( 'slug' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function info( req, res ) {

  req.agenda.getContributionInfo( function( err, info ) {

    cmn.render( req, res, 'contributors/info', {
      info: info
    } );

  });

}


function infoSubmit( req, res ) {

  req.agenda.setContributionInfo( req.body.info, true, function( err ) {

    if ( err ) return next( err );

    res.setFlash( req, 'The info has been updated' );

    res.redirect( req.genUrl( 'contributorsInfo', { slug: req.agenda.slug } ) );

  });

}

function invite( options ) {

  var params = utils.extend( {
    inviteMethod: 'inviteContributors',
    redirect: 'agendaAdminContributors'
  }, options ? options : {} );

  return function( req, res ) {

    if ( req.body.editors ) {

      invitationSvc.agenda( req.agenda )[ params.inviteMethod ]( {
        emails: req.body.editors, 
        lang: req.lang,
        userId: req.user.id
      }, ( err, invitations, result ) => {

        if ( err ) {

          res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

        } else if ( invitations.length == 0 ) {

          res.setFlash( req, 'No new invitation was sent' );

        } else {

          res.setFlash( req, 'Sent invitations: %s' , { '%s' : invitations.length } );

        }

        res.redirect( 302, req.genUrl( params.redirect, { slug: req.agenda.slug } ) )

      });
      
    } else {

      res.redirect( 302, req.genUrl( params.redirect, { slug: req.agenda.slug } ) )

    }

  }

}


function inviteResendAll( options ) {

  var params = utils.extend( {
    inviteMethod: 'resendInviteContributors',
    redirect: 'agendaAdminContributors'
  }, options || {} );

  return function( req, res ) {

    invitationSvc.agenda( req.agenda )[ params.inviteMethod ]( {
      lang: req.lang
    }, ( err, invitations, result ) => {

      if ( err ) {

        res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

      } else {

        res.setFlash( req, '%s invitations are being resent.<br/><br/>Note that invitations cannot be sent in bulk more than once every 24 hours' , { '%s' : invitations.length } );

      }

      res.redirect( 302, req.genUrl( params.redirect, { slug: req.agenda.slug } ) );

    } );

  }

}


function inviteResend( options ) {

  var params = utils.extend( {
    inviteMethod: 'inviteContributors',
    redirect: 'agendaAdminContributors'
  }, options ? options : {} );

  return function( req, res ) {

    if ( !req.query.email ) {

      res.redirect( 302, params.redirect, { slug: req.agenda.slug } );

      return;

    }

    invitationSvc.agenda( req.agenda )[ params.inviteMethod ]( {
      emails: req.query.email, 
      lang: req.lang,
      userId: req.user.id
    }, function( err, invitation, result ) {

      if ( err ) {

        res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

      } else if ( !invitation ) {

        req.log( 'error', JSON.stringify( result ) );

        res.setFlash( req, 'Invitation could not be sent' );

      } else {

        res.setFlash( req, 'The invitation is being resent' );

      }

      res.redirect( 302, req.genUrl( params.redirect, { slug: req.agenda.slug } ) );

    } );

  }

}


function _loadUserByEmail( req, res, next ) {

  if ( !req.query.email || !validator.isEmail( req.query.email ) ) {

    return next( {
      code: 400,
      message: 'email is wrong or missing'
    } );

  }

  userSvc.get( { email: req.query.email }, ( err, user ) => {

    if ( err ) return next( err );

    if ( !user ) return next( { code: 400, message: 'the target account does not exist' } );

    req.stakeholder = user;

    next();

  } );

}


function transfer( req, res, next ) {

  req.stakeholders.transferEvent( {
    event: { id: req.event.id },
    user: { id: req.stakeholder.id }
  }, err => {

    if ( err ) return next( err );

    // force ES update
    req.event.onSave();

    res.setFlash( req, 'ownership is transfered' );

    res.redirect( 302, req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } ) );

  } );

}