'use strict';

const _ = require( 'lodash' );
const async = require( 'async' );
const abilitiesSvc = require( '@openagenda/abilities' );
const agendasSvc = require( '@openagenda/agendas' );
const editableRules = require( './editableRules' );
const cmn = require( '../../lib/commons-app' );

const membersSvc = require( '../members' );
const usersSvc = require( '../users' );

const secureMw = ( req, res, next ) => {
  switch( req.query.entityName ) {
    case 'user':
      if ( !req.user || !req.user.uid || parseInt( req.query.identifier ) !== req.user.uid ) {
        res.status( 403 );
        throw new Error( 'You cannot get this rules index' );
      }
      return next();
    case 'agenda':
      return async.applyEachSeries( [
        agendasSvc.middleware.load( {
          private: null,
          internal: true,
          namespaces: {
            identifiers: {
              uid: 'query.identifier'
            }
          }
        } ),
        ( req, res, next ) => cmn.loadMemberRole( 'agenda', req, res, next ),
        ( req, res, next ) => {
          if ( ![ 'moderator', 'administrator' ].includes( req.role ) ) {
            res.status( 403 );
            throw new Error( 'You cannot get this rules index' );
          }
          next();
        }
      ], req, res, next );
    default:
      res.status( 403 );
      throw new Error( 'You cannot get this rules index' );
  }
};

module.exports = app => {
  // GET https://d.openagenda.com/abilities/form-index?entityName=user&identifier=99999999
  app.get(
    '/abilities/form-index',
    secureMw,
    abilitiesSvc.middleware.getFormIndex( abilitiesSvc, {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier'
      }
    } )
  );

  // PATCH https://d.openagenda.com/abilities/form-index?entityName=user&identifier=99999999
  app.patch(
    '/abilities/form-index',
    secureMw,
    abilitiesSvc.middleware.updateFormIndex( abilitiesSvc, {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier',
        data: 'body'
      }
    } )
  );
};

module.exports.init = async ( config, app ) => {
  abilitiesSvc.init( {
    knex: config.knex,
    mysql: config.db,
    schemas: config.schemas,
    entityMapping: {
      agenda: 'uid',
      member: 'id',
      user: 'uid'
    },

    interfaces: {
      getEntity: {
        agenda: uid => agendasSvc.get( { uid }, { private: null } ),
        member: id => membersSvc.get( id ),
        user:  uid => usersSvc.get( uid )
      },
      listEntities: {
        agenda: uids => agendasSvc.list( { uid: uids, order: 'updatedAt.desc' }, { private: null } ),
        member: ids => membersSvc
          .list( { id: ids }, { limit: 200 }, { detailed: true } )
          .then( members => members.map( m => _.omit(
            m.agenda ? Object.assign( m, { agendaTitle: m.agenda.title } ) : m,
            [ 'agenda', 'user' ]
          ) ) ),
        user: async uids => (await usersSvc.find( { query: { uid: { $in: uids } } } )).data
      },
      defaultFor: {
        user( { can, cannot, rules } ) {
          can( 'receive', 'invitation' );
          can( 'receive', 'notificationsSummary' );
          can( 'receive', 'memberMessage' );
          can( 'receive', 'userInboxMessage' );
          can( 'receive', 'agendaInboxMessage' );
          can( 'receive', 'event' );
          can( 'receive', 'eventCreation' );
          cannot( 'receive', 'eventChangeState' );
          can( 'receive', 'eventChangeState', { state: 2 } );
          cannot( 'receive', 'eventUpdate' );
          cannot( 'receive', 'eventAggregation' );
          cannot( 'receive', 'eventAddition' );
          cannot( 'receive', 'myEventCreation' );
          can( 'receive', 'myEventChangeState' );
          cannot( 'receive', 'myEventUpdate' );
          can( 'receive', 'myEventAggregation' );
          can( 'receive', 'myEventAddition' );

          return rules;
        }
      },
      defineFor: {
        // agenda = agenda
        // user = user
        // member = agenda + user + member

        async agenda( agenda, builder, options = {} ) {
          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'agenda' );
          const agendaRules = options.rules
            ? _.filter( options.rules, { entityName: 'agenda', identifier: agenda.id } )
            : ( await abilitiesSvc.rules.list( 'agenda', agenda.uid ) );

          return defaultRules
            .concat( builder.rules ) // the rules defined with can/cannot in this block
            .concat( agendaRules );
        },
        async user( user, builder, options = {} ) {
          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'user' );
          const userRules = options.rules
            ? _.filter( options.rules, { entityName: 'user', identifier: user.uid } )
            : ( await abilitiesSvc.rules.list( 'user', user.uid ) );

          return defaultRules
            .concat( builder.rules ) // the rules defined with can/cannot in this block
            .concat( userRules );
        },
        async member( member, builder, options = {} ) {
          const defineForFns = abilitiesSvc.config.interfaces.defineFor;

          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'member' );
          const memberRules = options.rules
            ? _.filter( options.rules, { entityName: 'member', identifier: member.id } )
            : ( await abilitiesSvc.rules.list( 'member', member.id ) );

          // const agendaRules = ( await abilitiesSvc.get( 'agenda', member.agendaUid ) ).rules;
          // const userRules = ( await abilitiesSvc.get( 'user', member.userUid ) ).rules;
          const agendaRules = await defineForFns.agenda(
            { uid: member.agendaUid },
            abilitiesSvc.createBuilder( 'agenda', member.agendaUid ),
            options
          );
          const userRules = await defineForFns.user(
            { uid: member.userUid },
            abilitiesSvc.createBuilder( 'user', member.userUid ),
            options
          );

          return agendaRules
            .concat( userRules )
            .concat( defaultRules )
            .concat( builder.rules ) // the rules defined with can/cannot in this block
            .concat( memberRules );
        }
      },
      completeFormIndex: {
        user: async ( ability, options ) => {
          const members = options.entities
            ? options.entities.members
            : await membersSvc.list( { userUid: ability.identifier } );

          return {
            user: ability.identifier,
            member: members.map( v => v.id )
          };
        }
      },
      editableRules
    }
  } );

  await abilitiesSvc.config.migrate();
};
