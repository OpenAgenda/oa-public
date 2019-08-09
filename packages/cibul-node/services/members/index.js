"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const ih = require( 'immutability-helper' );

const Service = require( '@openagenda/members' );
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );

const mail = require( './lib/mail' );
const streamCsv = require( './lib/streamCsv' );
const streamXlsx = require( './lib/streamXlsx' );
const flatten = require( './lib/flatten' );
const queues = require( '../queues' );

const getEventCountByUserUid = require( './getEventCountByUserUid' );
const getUsersByUid = require( './getUsersByUid' );
const getAgendasByUid = require( './getAgendasByUid' );
const onCreate = require( './onCreate' );
const onRemove = require( './onRemove' );
const onPatch = require( './onPatch' );

const {
  isSuperiorTo
} = require( '@openagenda/members' ).utils.compareRoles;

const members = {};
const config = {};

let _messages = () => {};

module.exports = parentApp => {

  parentApp.all( [
    '/:agendaSlug/admin/members.:format',
    '/:agendaSlug/admin/members/invite',
    '/:agendaSlug/admin/members/send-message',
    '/:agendaSlug/admin/members/:id',
    '/:agendaSlug/admin/members/:id/invite/resend'
  ], [
    sessions.middleware.ifUnlogged( ( req, res ) => res.status( 403 ).json( {
      message: 'A session must be opened to access this route',
    } ) ),
    _loadAgenda,
    _loadMember,
    _authorizeModerator
  ] );

  parentApp.get(
    '/:agendaSlug/admin/members.:format',
    ( req, res, next ) => {
      req.order = 'actionsCounter.desc';
      next();
    }
  );

  parentApp.get(
    '/:agendaSlug/admin/members.json',
    async ( req, res, next ) => {
      res.json( await members.list( ih( req.query, {
        agendaUid: { $set: req.agenda.uid },
        deletedUser: { $set: null }
      } ), Object.assign( {}, req.query, { order: req.order } ), {
        legacy: true,
        detailed: true,
        total: true
      } ) );
    }
  );

  parentApp.get( [
    '/:agendaSlug/admin/members.csv',
    '/:agendaSlug/admin/members.xlsx'
  ], ( req, res, next ) => {
    req.stream = members.stream( ih( req.query, {
      agendaUid: { $set: req.agenda.uid }
    } ), { order: req.order }, {
      detailed: true,
      transform: flatten( req.lang )
    } );

    next();
  } );

  parentApp.post( '/:agendaSlug/admin/members/invite',
    _moderatorCannotInviteAdmin,
    _loadContext,
    ( req, res, next ) => members.set.byEmail.bulk( {
      agendaUid: req.agenda.uid,
      role: req.body.role
    }, req.body.emails, {
      requireCustom: false,
      context: req.context
    } ).then( ( { queued } ) => {
      res.status( 200 ).json( {
        success: true,
        queued: !!queued
      } );
    }, next )
  );

  parentApp.post( '/:agendaSlug/admin/members/send-message',
    _requiredInvitationMessageCredential,
    _sendMessage
  );

  parentApp.delete( '/:agendaSlug/admin/members/:id',
    _loadTargetMember,
    _verifyCredentials,
    ( req, res, next ) => members.remove( req.targetMember.id ).then( () => {
      res.status( 200 ).json( { message: 'done.' } );
    }, next )
  );

  parentApp.patch( '/:agendaSlug/admin/members/:id',
    _loadTargetMember,
    _verifyCredentials,
    _loadContext,
    ( req, res, next ) => members.patch( req.targetMember.id, req.body, {
      context: req.context,
      requireCustom: false
    } ).then( result => {
      res.status( 200 ).json( { message: 'woopidoo' } );
    }, next )
  );

  parentApp.put( '/:agendaSlug/admin/members/:id/invite/resend',
    _loadTargetMember,
    ( req, res, next ) => mail.resendInvitation( config, {
      agenda: req.agenda,
      member: req.targetMember
    } ).then( () => res.status( 200 ).json( { message: 'pabim.' } ), next )
  );

  parentApp.get( '/:agendaSlug/admin/members.csv', streamCsv );
  parentApp.get( '/:agendaSlug/admin/members.xlsx', streamXlsx );

};

module.exports.utils = Service.utils;

module.exports.init = c => {
  Object.assign( config, c );

  Object.assign( members, Service( {
    knex: config.knex,
    schema: 'reviewer',
    queues,
    bulkThreshold: 10,
    logger: config.getLogConfig( 'svc', 'members' ),
    interfaces: {
      getEventCountByUserUid,
      getUsersByUid,
      getAgendasByUid,
      onCreate: onCreate.bind( null, config ),
      onRemove,
      onPatch: onPatch.bind( null, config )
    }
  } ) );

  _messages = mail.messages( config, {
    queues,
    members
  } );

  Object.assign(
    module.exports,
    members, {
      task: () => {
        members.task();
        _messages.task();
      }
    }
  );
}

function _sendMessage( req, res, next ) {
  _messages( Object.assign( req.query || {}, {
    agendaUid: req.agenda.uid,
    role: _.get( req, 'query.credentials' )
  } ), {
    message: req.body.message,
    lang: req.lang,
    replyTo: req.body.replyTo,
    withActions: req.body.inactive ? false : null,
    agenda: _.pick( req.agenda, [ 'uid', 'slug', 'title', 'image' ] )
  } );
  res.send( 'gemini jellikers batman' );
}

function _loadContext( req, res, next ) {
  req.context = _.merge( {
    lang: req.lang,
    sender: {
      userUid: req.user.uid,
      memberName: _.get( req, 'member.custom.contactName' ) || req.user.fullName
    }
  }, req.body.context );
  next();
}

function _loadTargetMember( req, res, next ) {
  members.get( {
    agendaUid: req.agenda.uid,
    id: req.params.id
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.targetMember = member;
    next();
  }, next );
}

function _loadAgenda( req, res, next ) {
  agendasSvc.get( { slug: req.params.agendaSlug }, {
    private: null,
    internal: true,
    includeImagePath: true
  } ).then( agenda => {
    if ( !agenda ) return next( { code: 404 } );
    req.agenda = agenda;
    next();
  } );
}

function _loadMember( req, res, next ) {
  members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.member = member;
    next();
  }, next );
}

function _authorizeModerator( req, res, next ) {
  if ( req.member && isSuperiorTo( req.member.role, 'contributor' ) ) {
    return next();
  }
  return next( { message: 'Not authorized', code: 403 } );
}

function _moderatorCannotInviteAdmin( req, res, next ) {
  if ( isSuperiorTo( req.body.role, req.member.role ) ) {
    return res.status( 400 ).json( { error: 'You cannot invite administrators' } );
  }
  return next();
}

function _verifyCredentials( req, res, next ) {
  if ( req.role === 'moderator' && req.targetMember.role === 'administrator' ) {
    return res.status( 400 ).json( { error: 'You cannot edit an administrator' } );
  }
  return next();
}

function _requiredInvitationMessageCredential( req, res, next ) {
  if ( !req.agenda.credentials.invitationMessage ) {
    return res.status( 400 ).json( { error: 'This feature is not available on this agenda' } );
  }
  return next();
}
