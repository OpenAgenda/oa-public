"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'agenda/stakeholders' ),

invitationSvc = require( '../services/invitation' ),

utils = require( '../lib/utils' ),

routes = {

  contributorsInvite:  [ 'post', '/contributors/invite', [ 
    cmn.checkAdminOrModerator,
    invite()
  ] ],

  administratorsInvite: [ 'post', '/admins/invite', [
    cmn.checkAdministrator,
    invite( { inviteMethod: 'inviteAdministrators', redirect: 'agendaAdminAdministrators' } )
  ]],

  moderatorsInvite: [ 'post', '/moderators/invite', [
    cmn.checkAdministrator,
    invite( { inviteMethod: 'inviteModerators', redirect: 'agendaAdminModerators' } )
  ]],

  contributorInviteResend: [ 'get', '/contributors/resend', [ 
    cmn.checkAdminOrModerator,
    inviteResend()
  ] ],

  administratorInviteResend: [ 'get', '/admins/resend', [
    cmn.checkAdministrator,
    inviteResend( { inviteMethod: 'inviteAdministrators', redirect: 'agendaAdminAdministrators' } )
  ] ],

  moderatorsInviteResend: [ 'get', '/moderators/resend', [
    cmn.checkAdministrator,
    inviteResend( { inviteMethod: 'inviteModerators', redirect: 'agendaAdminModerators' })
  ] ],

  contributorsInfo: [ 'get', '/contributors/info', [ 
    cmn.checkAdministrator,
    cmn.loadBaseData( _layoutData ),
    info
  ] ],

  contributorsInfoSubmit: [ 'post', '/contributors/info', [
    cmn.checkAdministrator,
    cmn.loadBaseData( _layoutData ),
    infoSubmit
  ] ]
  
};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadAgenda( 'slug' )
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

      invitationSvc.agenda( req.agenda )[ params.inviteMethod ]( req.body.editors, req.lang, function( err, invitations, result ) {

        if ( err ) {

          res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

        } else if ( invitations.length == 0 ) {

          res.setFlash( req, 'No new invitation was sent' );

        } else {

          res.setFlash( req, 'Sent invitations: %s' , { '%s' : invitations.length } );

        }

        cmn.redirect( req, res, params.redirect, { slug: req.agenda.slug } );

      });
      
    } else {

      cmn.redirect( req, res, params.redirect, { slug: req.agenda.slug } );

    }

  }

}


function inviteResend( options ) {

  var params = utils.extend( {
    inviteMethod: 'inviteContributors',
    redirect: 'agendaAdminContributors'
  }, options ? options : {} );

  return function( req, res ) {

    if ( !req.query.email ) {

      cmn.redirect(req, res, params.redirect, { slug: req.agenda.slug } );

      return;

    }

    invitationSvc.agenda( req.agenda )[ params.inviteMethod ]( req.query.email, req.lang, function( err, invitation, result ) {

      if ( err ) {

        res.setFlash( req, 'Something went wrong. We will fix this shortly.' );

      } else if ( !invitation ) {

        log( 'error', JSON.stringify( result ) );

        res.setFlash( req, 'Invitation could not be sent' );

      } else {

        res.setFlash( req, 'The invitation is being resent' );

      }

      cmn.redirect(req, res, params.redirect, { slug: req.agenda.slug } );

    } );

  }

}




function _layoutData( req, res ) {

  return {
    agenda: {
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false )
    }
  };

}