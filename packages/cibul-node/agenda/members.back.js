"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const _ = require( 'lodash' );
const { middleware: agendasMw } = require( '@openagenda/agendas' );
const createApp = require( '@openagenda/member-apps/dist/app' );
const stakeholdersMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );
const sessions = require( '@openagenda/sessions' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const { mw: { load: oldAgendaLoad } } = require( '../services/agenda' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'members' }
);

const routes = {

  agendaAdminMembers: [ 'get', '', matchApp ],
  membersSub: [ 'get', '/?*?', matchApp ],

  /**********/

  membersList: [ 'get', '/stakeholders.json', [
    stakeholdersMw.agenda( 'agendaInstance.data' ).list( { total: true, detailed: true } ),
    _parseListResult(),
    ( { stakeholders, total }, res ) => res.json( { stakeholders, total } )
  ] ],

  membersStats: [ 'get', '/stats', [
    stakeholdersMw.agenda( 'agendaInstance.data' ).stats(),
    ( { stats }, res ) => res.json( { stats } )
  ] ],

  membersRemove: [ 'get', '/remove/:id', [
    ( req, res, next ) => {
      req.identifiers = { id: req.params.id };
      next();
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
        stakeholder: 'stakeholderToUse',
        instance: 'stakeholderInstanceToUse'
      }
    } ),
    _protectDeletion(),
    stakeholdersMw.agenda( 'agendaInstance.data' ).remove(),
    ( { result }, res ) => res.status( !result.success ? 400 : 200 ).json( result )
  ] ],

  membersUpdate: [ 'post', '/update/:id', [
    ( req, res, next ) => {
      req.identifiers = { id: req.params.id };
      next();
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
        stakeholder: 'stakeholderToUse',
        instance: 'stakeholderInstanceToUse'
      }
    } ),
    _setUpdateContext(),
    _protectUpdate(),
    stakeholdersMw.agenda( 'agendaInstance.data' ).update( {
      namespaces: {
        data: 'body'
      },
      credential: true,
      allowPartial: true
    } ),
    ( { result }, res ) => res.status( result.errors.length ? 400 : 200 ).json( result )
  ] ],

  membersInvite: [ 'post', '/invite', [
    _protectInvite(),
    _setInviteContext(),
    stakeholdersMw.agenda( 'agendaInstance.data' ).bulk( {
      namespaces: {
        data: 'body'
      },
      allowPartial: true
    } ),
    _parseInviteResult(),
    ( { result }, res ) => {
      const status = (result.errors && result.errors.length) || !result.success ? 400 : 200;
      res.status( status ).json( result )
    }
  ] ],

  membersSendMessage: [ 'post', '/send-message', [
    _sendMessage(),
    ( { result }, res ) => res.status( result.errors && result.errors.length ? 400 : 200 ).json( result )
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'members' ),
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
      includeImagePath: true,
      private: null
    } ),
    ( req, res, next ) => {
      if ( !req.agendaInstance ) return next( { code: 404 } );
      req.identifiers = { userId: req.user.id };
      next();
    },
    stakeholdersMw.agenda( 'agendaInstance.data' ).get( {
      namespaces: {
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
    cmn.authorize.moderator,
    agendasMw.evaluateIPAddress( {
      namespaces: {
        agenda: 'agendaInstance'
      },
      onUnauthorizedIPAddress: ( req, res, next ) => {

        if ( process.env.NODE_ENV === 'development' ) return next();

        req.log( 'info', 'IP %s is not authorized for agenda %s', req.header( 'x-forwarded-for' ), req.agendaInstance.data.slug );

        res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agendaInstance.data.slug } ) );

      }
    } )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};

async function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'agendaAdminMembers', { slug: req.params.slug } ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, context } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        app: req.genUrl( 'agendaAdminMembers', { slug: req.agenda.slug } ),
        list: req.query.test ? `/${req.agenda.slug}/admin/members.json` : req.genUrl( 'membersList', { slug: req.agenda.slug } ),
        update: req.genUrl( 'membersUpdate', { slug: req.agenda.slug, id: ':id' } ),
        remove: req.genUrl( 'membersRemove', { slug: req.agenda.slug, id: ':id' } ),
        invite: req.genUrl( 'membersInvite', { slug: req.agenda.slug } ),
        stats: req.genUrl( 'membersStats', { slug: req.agenda.slug } ),
        showContributor: req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ) + '?contributorId=:contributorId',
        writeToMember: req.genUrl( 'conversationDiscussion', { uid: ':uid', redirect: ':redirect' } ),
        exportToCsv: req.genUrl( 'agendaContributorsCsv', { slug: req.agenda.slug } ),
        exportToXlsx: req.genUrl( 'agendaContributorsXlsx', { slug: req.agenda.slug } ),
        sendMessage: req.genUrl( 'membersSendMessage', { slug: req.agenda.slug } )
      },
      agenda: {
        uid: req.agenda.uid,
        slug: req.agenda.slug,
        title: req.agenda.title,
        ownerId: req.agenda.ownerId,
        credentials: req.agendaInstance.data.credentials,
        roles: req.agendaRoles
      },
      stakeholder: req.stakeholder
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( context.status === 404 ) {
      return next();
    }

    if ( context.url ) {
      return res.redirect( 301, context.url );
    }

    const { pathname, search } = state.router.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 301, pathname );
    }

    return res.send( layout( `<div class="js_canvas">${content}</div>`, {
      lang: req.lang,
      agenda: req.agendaInstance.data,
      bodyAttributes: [ {
        name: 'data-options',
        value: JSON.stringify( { initialState: state } )
      } ],
      scripts: {
        bottom: [ { src: '/js/membersIndex.js' } ]
      }
    } ) );

  } catch ( e ) {
    next( e );
  }

}


function _parseListResult() {

  return ( req, res, next ) => {
    req.stakeholders = req.stakeholders.map( s => {
      s.invited = !s.userId && !s.deletedUser;
      s.owner = s.userId === req.user.id;
      return _.omit( s, 'userId', 'user.id' );
    } );
    next();
  };

}

function _protectDeletion() {

  return ( req, res, next ) => {
    if ( !req.stakeholderToUse ) {
      return res.status( 400 ).json( { error: 'This stakeholder cannot be found' } );
    }
    if ( req.stakeholderToUse.userId === req.agenda.ownerId ) {
      return res.status( 400 ).json( { error: 'You don\'t have right to remove the owner of this agenda' } );
    }
    if ( req.stakeholder.credential === 3 && [ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
      return res.status( 400 ).json( { error: 'You don\'t have right to remove this stakeholder' } );
    }
    next();
  };

}

function _setUpdateContext() {

  return ( req, res, next ) => {
    req.context = _.merge( {
      lang: req.lang,
      invitationSender: {
        userId: req.stakeholder.userId,
        name: req.stakeholder.custom.contactName
      }
    }, req.body.context );
    next();
  };

}

function _protectUpdate() {

  return ( req, res, next ) => {
    if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
      return next();
    }
    return res.status( 400 ).json( { error: 'You don\'t have right to update this stakeholder' } );
  };

}

function _protectInvite() {

  return ( req, res, next ) => {
    if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.body.credential ) ) {
      return next();
    }
    return res.status( 400 ).json( { error: 'You don\'t have right to invite members with this role' } );
  };

}

function _setInviteContext() {

  return ( req, res, next ) => {
    req.context = _.merge( {
      lang: req.lang,
      invitationSender: {
        userId: req.stakeholder.userId,
        name: req.stakeholder.custom.contactName
      }
    }, req.body.context );
    next();
  };

}

function _parseInviteResult() {

  return ( req, res, next ) => {

    const { queued } = req.result;
    const [ errors, results ] = _.unzip( req.result.results ).map( _.compact );

    if ( errors && errors.length ) {
      return res.status( 400 ).json( { errors } );
    }

    const emailsRejected = _.compact( (results || []).reduce( ( prev, nextResult, i ) => {
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

  };

}

function _sendMessage() {

  return ( req, res, next ) => {

    if ( !req.agendaInstance.data.credentials.invitationMessage ) {

      return res.status( 400 ).json( { error: 'You don\'t have right to send message to multiple members' } );

    }

    req.context = { lang: req.lang, user: req.user, replyTo: req.body.replyTo };

    stakeholdersMw.agenda( 'agendaInstance.data' ).message( {
      namespaces: {
        message: 'body.message',
        query: 'query'
      },
      actionsCounterEqualZero: req.body.inactive ? true : null,
      deletedUser: false
    } )( req, res, next );

  };

}
