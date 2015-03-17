"use strict";

var appName = 'agenda/contributors', app,

cmn = require( '../lib/commons-app' ),

routes = {
  contributorsInvite:  [ 'post', invite, '/invite' ],
  contributorInviteResend: [ 'get', inviteResend, '/resend' ]
},

log = require( '../lib/logger' )( appName ),

path,

invitationSvc = require( '../services/invitation/invitation.js' );

module.exports = init;

function init( p ) {

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return {
    load: load
  }

}

function load( main ) {

  if ( app ) return;

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  cmn.loadRoutes( app, routes, [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadAgenda( 'slug' ),
    cmn.checkAdministrator
  ] );

}

function invite( req, res ) {

  if ( req.body.editors ) {

    invitationSvc.agenda( req.agenda ).inviteContributors( req.body.editors, req.lang, function( err, invitations, result ) {

      if ( err ) {

        res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

      } else if ( invitations.length == 0 ) {

        res.setFlash( req, 'No new invitation was sent' );

      } else {

        res.setFlash( req, 'Sent invitations: %s' , { '%s' : invitations.length } );

      }

      cmn.redirect(req, res, 'agendaAdminContributors', { slug: req.agenda.slug } );

    });
    
  } else {

    cmn.redirect(req, res, 'agendaAdminContributors', { slug: req.agenda.slug } );

  }

}

function inviteResend( req, res ) {

  if ( !req.query.email ) {

    cmn.redirect(req, res, 'agendaAdminContributors', { slug: req.agenda.slug } );

    return;

  }

  invitationSvc.agenda( req.agenda ).inviteContributors( req.query.email, req.lang, function( err, invitation, result ) {

    if ( err ) {

      res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

    } else if ( !invitation ) {

      log( 'error', JSON.stringify( result ) );

      res.setFlash( req, 'Invitation could not be sent' );

    } else {

      res.setFlash( req, 'The invitation is being resent' )

    }

    cmn.redirect(req, res, 'agendaAdminContributors', { slug: req.agenda.slug } );

  } );

}