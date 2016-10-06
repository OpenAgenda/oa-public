"use strict";

const utils = require( 'utils' ),

streamUtils = require( 'stream-utils' ),

flattener = require( 'flattener' ),

validator = require( 'validator' ),

csv = require( 'fast-csv' ),

xlsx = require( 'xlsx-writestream' ),

getLabel = require( 'labels' )( require( 'labels/contributors/exportHeaders' ) ),

getCredentialLabel = require( 'labels' )( require( 'labels/contributors/credentials' ) );

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

invitationSvc = require( '../services/invitation' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

userSvc = require( '../services/user' ),

stakeholders = require( 'agenda-stakeholders' ),

stakeholdersMw = require( 'agenda-stakeholders/middleware' ),


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

  stakeholdersCsvExport: [ 'get', '/contributors.csv', [
    cmn.checkAdminOrModerator,
    _loadFlattener,
    streamCsv
  ] ],

  stakeholdersXlsxExport: [ 'get', '/contributors.xlsx', [
    cmn.checkAdminOrModerator,
    _loadFlattener,
    streamXlsx
  ] ],

  contributorsInfo: [ 'get', '/contributors/info', [ 
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
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
    stakeholdersMw.loadAgenda( 'agenda', 'stakeholders' ),
    _loadUserByEmail,
    transfer
  ] ],

  stakeholderGet: [ 'get', '/contributors/:uid.json', [
    cmn.checkAdminOrModerator,
    _loadUserByUid,
    stakeholdersMw.load( 'agenda', 'queriedUser' ),
    ( req, res ) => {

      res.json( { name: req.queriedUser.fullName } );

    }
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

  req.agenda.getContributionInfo( ( err, info ) => {

    cmn.render( req, res, 'contributors/info', {
      info
    } );

  });

}


function infoSubmit( req, res ) {

  req.agenda.setContributionInfo( req.body.info, true, function( err ) {

    if ( err ) return next( err );

    res.setFlash( req, 'The info has been updated' );

    res.redirect( req.genUrl( 'contributorsInfo', { slug: req.agenda.slug } ) );

  } );

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

        } else if ( result.count ) {

          res.setFlash( req, 'Your %s submitted emails are being processed', { '%s' : result.count } );

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

  return ( req, res ) => {

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

function _loadFlattener( req, res, next ) {

  req.flatten = flattener( [ {
    source: [ 'user.full_name', 'custom.contactName' ],
    transform: ( fullName, contactName ) => contactName || fullName,
    target: getLabel( 'name', req.lang )
  }, {
    source: 'credential',
    transform: _getCredentialLabel( req.lang ),
    target: getLabel( 'credential', req.lang )
  }, {
    source: 'custom.email',
    target: getLabel( 'email', req.lang )
  }, {
    source: 'custom.organization.label',
    target: getLabel( 'organization', req.lang )
  }, {
    source: 'custom.contactNumber',
    target: getLabel( 'phone', req.lang )
  }, {
    source: 'custom.contactPosition',
    target: getLabel( 'position', req.lang )
  }, {
    source: 'eventCount',
    target: getLabel( 'contributions', req.lang )
  } ] );

  next();

}


function _getCredentialLabel( lang ) {

  return c => [
    getCredentialLabel( 'contributor', lang ),
    getCredentialLabel( 'administrator', lang ),
    getCredentialLabel( 'moderator', lang )
  ][ c - 1 ];

}


function streamStakeholders( req, res, next ) {

  switch( req.params.format ) {

    case 'csv': return _streamCsv( req, res, next );

    case 'xlsx': return _streamXlsx( req, res, next );

    default:

      next( { code: 400, message: 'Export format unavailable' } );

  }

}


function streamCsv( req, res ) {

  let listStream = streamUtils.read.list( stakeholders( req.agenda.id ).list, { detailed: true } ),

  transform = streamUtils.transform( req.flatten ),

  csvStream = csv.createWriteStream( {
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"'
  } );

  listStream.pipe( transform ).pipe( csvStream ).pipe( res );

  res.writeHead( 200, {
    'Content-Type' : 'text/csv',
    'content-disposition' : `attachment; filename="contributors.${req.agenda.title}.csv"`
  } );

}


function streamXlsx( req, res, next ) {

  let listStream = streamUtils.read.list( stakeholders( req.agenda.id ).list, { detailed: true } ),

  transform = streamUtils.transform( req.flatten ),

  xlsxStream = new xlsx();

  xlsxStream.getReadStream().pipe( res );

  listStream.pipe( transform )

    .on( 'data', data => xlsxStream.addRow( data ) )

    .on( 'end', () => xlsxStream.finalize() );


  res.writeHead( 200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition' : `attachment; filename="contributors.${req.agenda.title}.xlsx"`
  } );

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


function _loadUserByUid( req, res, next ) {

  userSvc.get( { uid: req.params.uid }, ( err, user ) => {

    if ( err ) return next( err );

    req.queriedUser = user;

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