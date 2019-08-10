"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const ih = require( 'immutability-helper' );

const Service = require( '@openagenda/members' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'services/members' );

const mail = require( './lib/mail' );
const streamCsv = require( './lib/streamCsv' );
const streamXlsx = require( './lib/streamXlsx' );
const queues = require( '../queues' );

const getEventCountByUserUid = require( './getEventCountByUserUid' );
const getUsersByUid = require( './getUsersByUid' );
const getAgendasByUid = require( './getAgendasByUid' );
const onCreate = require( './onCreate' );
const onRemove = require( './onRemove' );
const onPatch = require( './onPatch' );

const mw = {
  list: require( './middleware/list' ),
  loadAgenda: require( './middleware/loadAgenda' ),
  loadMember: require( './middleware/loadMember' ),
  loadTargetMember: require( './middleware/loadTargetMember' ),
  loadContext: require( './middleware/loadContext' ),
  invite: require( './middleware/invite' ),
  sendMessage: require( './middleware/sendMessage' ),
  spreadsheet: require( './middleware/spreadsheet' ),
  authorize: require( './middleware/authorize' )
}

const members = {};
const config = {};

module.exports = Object.assign( plugApp, {
  init,
  utils: Service.utils
} );

function init( c ) {
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

  const messages = mail.messages( config, {
    queues,
    members
  } );

  mw.sendMessage.init( messages );

  Object.assign(
    module.exports,
    members, {
      task: () => {
        log( 'running tasks' );
        members.task();
        messages.task();
      }
    }
  );
}

function plugApp( parentApp ) {

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
    mw.authorize.agendaHasInvitationMessageCredential,
    mw.sendMessage
  );

  parentApp.delete( '/:agendaSlug/admin/members/:id',
    mw.loadTargetMember.bind( null, members ),
    mw.authorize.moderatorCannotEditAdministrator,
    ( req, res, next ) => members.remove( req.targetMember.id ).then( () => {
      res.status( 200 ).json( { message: 'done.' } );
    }, next )
  );

  parentApp.patch( '/:agendaSlug/admin/members/:id',
    mw.loadTargetMember.bind( null, members ),
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
    mw.loadTargetMember.bind( null, members ),
    ( req, res, next ) => mail.resendInvitation( config, {
      agenda: req.agenda,
      member: req.targetMember
    } ).then( () => res.status( 200 ).json( { message: 'pabim.' } ), next )
  );

  parentApp.get( '/:agendaSlug/admin/members.csv', streamCsv );
  parentApp.get( '/:agendaSlug/admin/members.xlsx', streamXlsx );

};
