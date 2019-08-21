"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const ih = require( 'immutability-helper' );

const Service = require( '@openagenda/members' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'services/members' );

const mail = require( './lib/mail' );
const activities = require( './lib/activities' );
const streamCsv = require( './lib/streamCsv' );
const streamXlsx = require( './lib/streamXlsx' );
const transferEvent = require( './lib/transferEvent' );
const queues = require( '../queues' );

const getEventCountByUserUid = require( './getEventCountByUserUid' );
const getUsersByUid = require( './getUsersByUid' );
const getUserByEmail = require( './getUserByEmail' );
const getAgendasByUid = require( './getAgendasByUid' );
const onCreate = require( './onCreate' );
const onRemove = require( './onRemove' );
const onPatch = require( './onPatch' );

const mw = {
  authorize: require( './middleware/authorize' ),
  list: require( './middleware/list' ),
  loadAgenda: require( './middleware/loadAgenda' ),
  loadEvent: require( './middleware/loadEvent' ),
  loadMember: require( './middleware/loadMember' ),
  loadTargetMember: require( './middleware/loadTargetMember' ),
  loadContext: require( './middleware/loadContext' ),
  invite: require( './middleware/invite' ),
  sendMessage: require( './middleware/sendMessage' ),
  spreadsheet: require( './middleware/spreadsheet' )
}

const members = {};
const config = {};

module.exports = Object.assign( plugApp, {
  init,
  utils: Service.utils
} );

function init( c ) {
  Object.assign( config, c );

  const activityQueue = queues( 'memberActivities' );
  const messageQueue = queues( 'memberMessages' );

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
      getUserByEmail,
      onCreate: onCreate.bind( null, config ),
      onRemove: onRemove.bind( null, { members, activityQueue } ),
      onPatch: onPatch.bind( null, config )
    }
  } ) );

  const messages = mail.messages( config, {
    members,
    queue: messageQueue
  } );

  const {
    task: activityTask
  } = activities( { queue: activityQueue } );

  mw.sendMessage.init( messages );

  Object.assign(
    module.exports,
    members, {
      task: () => {
        log( 'running tasks' );
        members.task();
        messages.task();
        activityTask();
      },
      mw: {
        load: mw.loadMember.bind( null, members ),
        loadOrFail: mw.loadMember.loadOrFail.bind( null, members ),
        list: mw.list.bind( null, members ),
        authorize: {
          moderator: mw.authorize.moderator
        }
      }
    }
  );
}

function plugApp( parentApp ) {

  parentApp.all( [
    '/:agendaSlug/admin/members.:format',
    '/:agendaSlug/admin/members/stats',
    '/:agendaSlug/admin/members/invite',
    '/:agendaSlug/admin/members/send-message',
    '/:agendaSlug/admin/members/:id',
    '/:agendaSlug/admin/members/:id/details',
    '/:agendaSlug/admin/members/:id/invite/resend'
  ], [
    sessions.middleware.ifUnlogged( ( req, res ) => res.status( 403 ).json( {
      message: 'A session must be opened to access this route',
    } ) ),
    mw.loadAgenda,
    mw.loadMember.bind( null, members ),
    mw.authorize.moderator
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
    mw.list.bind( null, members )
  );

  parentApp.get(
    '/:agendaSlug/admin/members/stats',
    mw.list.stats.bind( null, members )
  );

  parentApp.get( [
    '/:agendaSlug/admin/members.csv',
    '/:agendaSlug/admin/members.xlsx'
  ], mw.spreadsheet.stream.bind( null, members ) );

  parentApp.post( '/:agendaSlug/admin/members/invite',
    mw.authorize.moderatorCannotInviteAdministrator,
    mw.loadContext,
    mw.invite.bind( null, members )
  );

  parentApp.post( '/:agendaSlug/admin/members/send-message',
    mw.authorize.agendaHasCredential.bind( null, 'invitationMessage' ),
    mw.sendMessage
  );

  // keep 'details' part as long as there are controllers in agenda/members.back.js
  parentApp.get( '/:agendaSlug/admin/members/:id/details',
    mw.loadTargetMember.bind( null, { detailed: true, members } ),
    ( req, res, next ) => res.json( { ..._.pick( req.targetMember, [
      'id',
      'role',
      'userUid',
      'custom'
    ] ),
      user: _.pick( req.targetMember.user, [ 'uid', 'fullName' ] )
    } )
  );

  parentApp.delete( '/:agendaSlug/admin/members/:id',
    mw.loadTargetMember.bind( null, { members } ),
    mw.authorize.moderatorCannotEditAdministrator,
    ( req, res, next ) => members.remove( req.targetMember.id, {
      context: { user: req.user }
    } ).then( () => {
      res.status( 200 ).json( { message: 'done.' } );
    }, next )
  );

  parentApp.patch( '/:agendaSlug/admin/members/:id',
    mw.loadTargetMember.bind( null, { members } ),
    mw.authorize.moderatorCannotEditAdministrator,
    mw.loadContext,
    ( req, res, next ) => members.patch( req.targetMember.id, req.body, {
      context: req.context,
      requireCustom: false
    } ).then( result => {
      res.status( 200 ).json( { message: 'woopidoo' } );
    }, next )
  );

  parentApp.put( '/:agendaSlug/admin/members/:id/invite/resend',
    mw.loadContext,
    mw.loadTargetMember.bind( null, { members } ),
    ( req, res, next ) => {
      members.set.byEmail( {
        agendaUid: req.agenda.uid,
        email: req.targetMember.custom.email
      }, { context: req.context } ).then( ( {
        member
      } ) => {
        if ( member.userUid ) {
          return res.status( 200 ).json( { message: 'user is member' } )
        }
        next();
      }, next );
    },
    ( req, res, next ) => mail.resendInvitation( config, {
      agenda: req.agenda,
      member: req.targetMember
    } ).then( () => res.status( 200 ).json( { message: 'pabim.' } ), next )
  );

  // should be put
  parentApp.post( '/:agendaSlug/admin/members/transfer/:eventSlug',
    mw.loadAgenda,
    mw.loadEvent,
    mw.loadMember.bind( null, members ),
    mw.authorize.adminModOrEventOwner,
    mw.authorize.agendaHasCredential.bind( null, 'eventOwnershipTransfer' ),
    mw.loadTargetMember.byEmail.bind( null, { members } ),
    ( req, res, next ) => transferEvent( req.event, req.targetMember ).then( () => {
      res.redirect( 302, `/${req.agenda.slug}/events/${req.event.slug}` );
    }, next )
  );


  parentApp.get( '/:agendaSlug/admin/members.csv', streamCsv );
  parentApp.get( '/:agendaSlug/admin/members.xlsx', streamXlsx );

};
