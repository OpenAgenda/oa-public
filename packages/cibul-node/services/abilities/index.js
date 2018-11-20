'use strict';

const express = require( 'express' );
const morgan = require( 'morgan' );
const async = require( 'async' );
const abilitiesSvc = require( '@openagenda/abilities' );
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );
const usersSvc = require( '@openagenda/users' );
const editableRules = require( './editableRules' );
const cmn = require( '../../lib/commons-app' );

const app = express();

app
  .use( express.json() )
  .use( express.urlencoded( { extended: true } ) );

if ( process.env.NODE_ENV === 'development' ) {
  app.use( morgan( 'dev' ) );
}

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

module.exports = ( parentApp, path ) => {
  app.use( sessions.middleware.load( { detailed: true } ) );

  // GET https://d.openagenda.com/abilities/form-index?entityName=user&identifier=99999999
  app.get(
    '/form-index',
    secureMw,
    abilitiesSvc.middleware.getFormIndex( {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier'
      }
    } )
  );

  // PATCH https://d.openagenda.com/abilities/form-index?entityName=user&identifier=99999999
  app.patch(
    '/form-index',
    secureMw,
    abilitiesSvc.middleware.updateFormIndex( {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier',
        data: 'body'
      }
    } )
  );

  parentApp.use( path, app );
};

module.exports.init = async config => {
  const memberRequest = () => config.knex( config.schemas.stakeholder )
    .select(
      `${config.schemas.stakeholder}.*`,
      `${config.schemas.agenda}.uid as agendaUid`,
      `${config.schemas.agenda}.title as agendaTitle`,
      `${config.schemas.user}.uid as userUid`
    )
    .join( config.schemas.user, `${config.schemas.user}.id`, '=', `${config.schemas.stakeholder}.user_id` )
    .join( config.schemas.agenda, `${config.schemas.agenda}.id`, '=', `${config.schemas.stakeholder}.review_id` );

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
        member: id => memberRequest().first().where( `${config.schemas.stakeholder}.id`, id ),
        user: uid => usersSvc.get( uid )
      },
      listEntities: {
        agenda: uids => agendasSvc.list( { uid: uids }, { private: null } ),
        member: ids => memberRequest().whereIn( `${config.schemas.stakeholder}.id`, ids ),
        user: uids => usersSvc.find( { query: { uid: { $in: uids } } } )
      },
      defaultFor: {
        user( { can, cannot, rules } ) {
          can( 'receive', 'invitation' );
          can( 'receive', 'notificationsSummary' );
          can( 'receive', 'memberMessage' );
          can( 'receive', 'inboxMessage' );
          can( 'receive', 'event' );
          can( 'receive', 'eventCreation' );
          can( 'receive', 'eventChangeState' );
          can( 'receive', 'eventUpdate' );
          can( 'receive', 'eventAggregation' );
          can( 'receive', 'myEventChangeState' );
          can( 'receive', 'myEventUpdate' );
          can( 'receive', 'myEventAggregation' );

          return rules;
        }
      },
      defineFor: {
        // agenda = agenda
        // user = user
        // member = agenda + user + member

        async agenda( agenda, builder, options = {} ) {
          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'agenda' );
          const agendaRules = options.rules || ( await abilitiesSvc.rules.list( 'agenda', agenda.uid ) );

          return defaultRules
            .concat( builder.rules ) // the rules defined with can/cannot in this block
            .concat( agendaRules );
        },
        async user( user, builder, options = {} ) {
          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'user' );
          const userRules = options.rules || ( await abilitiesSvc.rules.list( 'user', user.uid ) );

          return defaultRules
            .concat( builder.rules ) // the rules defined with can/cannot in this block
            .concat( userRules );
        },
        async member( member, builder, options = {} ) {
          const defineForFns = abilitiesSvc.config.interfaces.defineFor;

          const defaultRules = abilitiesSvc.rules.getDefaultFor( 'member' );
          const memberRules = options.rules || ( await abilitiesSvc.rules.list( 'member', member.id ) );

          // const agendaRules = ( await abilitiesSvc.get( 'agenda', member.agendaUid ) ).rules;
          // const userRules = ( await abilitiesSvc.get( 'user', member.userUid ) ).rules;
          const agendaRules = await defineForFns.agenda(
            { uid: member.agendaUid },
            abilitiesSvc.createBuilder( 'agenda', member.agendaUid )
          );
          const userRules = await defineForFns.user(
            { uid: member.userUid },
            abilitiesSvc.createBuilder( 'user', member.userUid )
          );

          // if ( isAdmin( user ) {
          //   can( ... );
          // } else {
          //   cannot( ... );
          // }

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
            : await memberRequest().where( `${config.schemas.user}.uid`, ability.identifier );

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
