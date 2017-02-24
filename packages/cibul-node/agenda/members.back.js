"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const bodyParser = require( 'body-parser' );
const { middleware: agendasMw, instanciate: instanciateAgenda } = require( 'agendas' );
const usersSvc = require( 'users' );
const stakeholdersSvc = require( 'agenda-stakeholders' );
const stakeholdersMw = require( 'agenda-stakeholders/middleware' );
const mw = require( 'member-apps/middleware' );
const { mw: { loadAdminLayout, load: oldAgendaLoad } } = require( '../services/agenda' );
const sessions = require( 'sessions' );
const _ = require( 'lodash' );


const appMw = [
  loadAdminLayout,
  cmn.loadBaseData( 'oasfmain.css' ),
  matchApp
];

const routes = {

  agendaAdminMembers: [ 'get', '', appMw ],
  membersSub: [ 'get', '/?*?', appMw ],

  /**********/

  membersList: [ 'get', '/stakeholders.json', [
    stakeholdersMw.agenda( 'agendaInstance.data' ).list( { detailed: true } ),
    ( { stakeholders, total }, res ) => res.json( { stakeholders, total } )
  ] ],

  membersStats: [ 'get', '/stats', [
    stakeholdersMw.agenda( 'agendaInstance.data' ).stats(),
    ( { stats }, res ) => res.json( { stats } )
  ] ],

  membersRemove: [ 'get', '/remove/:uid', [
    usersSvc.mw.load( 'params.uid', 'stakeholderUser' ),
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
        user: 'stakeholderUser',
        stakeholder: 'stakeholderToUse',
        instance: 'stakeholderInstanceToUse'
      }
    } ),
    ( req, res, next ) => {
      if ( req.stakeholder.credential === 3 && [ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
        return next( new Error( 'You don\'t have right to remove this stakeholder' ) );
      }
      next();
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).remove( {
      namespaces: {
        user: 'stakeholderUser'
      }
    } ),
    ( { result }, res ) => res.status( !result.success ? 400 : 200 ).json( result )
  ] ],

  membersUpdate: [ 'post', '/update/:uid', [
    usersSvc.mw.load( 'params.uid', 'stakeholderUser' ),
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
        user: 'stakeholderUser',
        stakeholder: 'stakeholderToUse',
        instance: 'stakeholderInstanceToUse'
      }
    } ),
    ( req, res, next ) => {
      if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
        return next();
      }
      next( new Error( 'You don\'t have right to update this stakeholder' ) );
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).update( {
      namespaces: {
        user: 'stakeholderUser',
        data: 'body'
      },
      credential: true
    } ),
    ( { result }, res ) => res.status( result.errors.length ? 400 : 200 ).json( result )
  ] ],

  membersInvite: [ 'post', '/invite', [
    ( req, res, next ) => {
      if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.body.credential ) ) {
        return next();
      }
      next( new Error( 'You don\'t have right to invite members with this role' ) );
    },
    ( req, res, next ) => {
      req.linkStore = {
        lang: req.lang
      }
      next();
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).bulk( {
      namespaces: {
        data: 'body'
      },
      allowPartial: true
    } ),
    ( req, res, next ) => {

      const { queued } = req.result;
      const [ errors, results ] = _.unzip( req.result.results ).map( _.compact );

      if ( errors.length ) return next( { errors } );

      const emailsRejected = _.compact( results.reduce( ( prev, nextResult, i ) => {
        let emailRejected;
        if ( nextResult.errors && nextResult.errors.length ) {
          emailRejected = nextResult.errors.reduce( ( prev, nextError ) => {
            return (nextError.code && req.body.stakeholders[ i ].email) || null;
          }, null );
        }
        return prev.concat( emailRejected );
      }, [] ) );

      req.result = { queued, emailsRejected, success: !emailsRejected.length };

      next();

    },
    ( { result }, res ) => {
      const status = (result.errors && result.errors.length) || !result.success ? 400 : 200;
      res.status( status ).json( result )
    }
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'members' ),
    bodyParser.json(),
    sessions.middleware.load(),
    sessions.middleware.ifUnlogged( cmn.redirectToSignin ),
    agendasMw.load( {
      namespaces: {
        identifiers: {
          slug: 'params.slug'
        },
        result: 'agendaInstance'
      },
      instanciate: true,
      internal: true,
      private: null
    } ),
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      }
    } ),
    agendasMw.loadRoles( {
      namespaces: {
        agenda: 'agendaInstance', // slug with req.params.slug in real world
        result: 'agendaRoles'
      },
      private: null
    } ),
    oldAgendaLoad( 'slug' ),
    cmn.checkAdministrator()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};


function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';
  const tab = 'members';

  cmn.render( req, res, 'members/index', { scriptParams: { state }, lang, content, tab } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'agendaAdminMembers', { slug: req.params.slug } ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  mw.matchApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20
        },
        res: {
          app: req.genUrl( 'agendaAdminMembers', { slug: req.agenda.slug } ),
          list: req.genUrl( 'membersList', { slug: req.agenda.slug } ),
          update: req.genUrl( 'membersUpdate', { slug: req.agenda.slug, uid: ':uid' } ),
          remove: req.genUrl( 'membersRemove', { slug: req.agenda.slug, uid: ':uid' } ),
          invite: req.genUrl( 'membersInvite', { slug: req.agenda.slug } ),
          stats: req.genUrl( 'membersStats', { slug: req.agenda.slug } ),
          showContributor: req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ) + '?contributorUid=:contributorUid',
          writeToMember: req.genUrl( 'conversationDiscussion', { uid: ':uid', redirect: ':redirect' } ),
          exportToCsv: req.genUrl( 'agendaContributorsCsv', { slug: req.agenda.slug } ),
          exportToXlsx: req.genUrl( 'agendaContributorsXlsx', { slug: req.agenda.slug } )
        },
        agenda: {
          uid: req.agenda.uid,
          slug: req.agenda.slug,
          title: req.agenda.title,
          roles: req.agendaRoles
        },
        stakeholder: req.stakeholder
      }
    },
    prefix,
    getApp
  )( req, res, next );

}