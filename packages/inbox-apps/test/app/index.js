"use strict";

process.env.DEBUG_COLORS = true;

if ( !process.env.DEBUG ) {
  process.env.DEBUG = 'oa:*';
}

const logs = require( '@openagenda/logs' );
logs.init( { debug: { prefix: 'oa:' } } );

const React = require( 'react' );
const _ = require( 'lodash' );
const async = require( 'async' );
const ReactDOM = require( 'react-dom/server' );
const morgan = require( 'morgan' );
const bodyParser = require( 'body-parser' );
const inboxes = require( '@openagenda/inboxes' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const config = require( '../../testconfig.js' );
const mw = require( '../../lib/middleware' );

const port = process.env.PORT || 3000;

const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/../../.tmp/testapp-client.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( morgan( 'dev' ) );

app.use( ( req, res, next ) => {
  if ( !req.query._app ) req.query._app = 'agendaAdmin';
  next();
} );

app.use( ( req, res, next ) => {
  switch ( req.query._app ) {
    case 'agendaAdmin':
      return async.applyEachSeries( [
        loadUser(),
        loadAgenda()
      ], req, res, next );
    default:
      next();
  }
} );

app.get( '*', matchApp );


run().catch( console.error );

async function run() {

  inboxes.init( config );
  inboxMw.init( config );

  /*******/

  app.get( '/agendaAdmin/conversations/:conversationId/action/:code', [
    loadAgenda(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.conversations.action( {
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
        code: 'params.code'
      }
    } )
  ] );

  app.get( '/agendaAdmin/conversations/:conversationId/messages', [
    loadAgenda(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.messages.list( {
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid'
      },
      limit: config.mw.limit
    } )
  ] );

  app.post( '/agendaAdmin/conversations/:conversationId/messages', [
    loadUser(),
    loadAgenda(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.messages.create( {
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        body: 'body.body',
        userUid: 'user.uid'
      }
    } )
  ] );

  app.get( '/agendaAdmin/conversations', [
    loadAgenda(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid'
      },
      limit: config.mw.limit
    } )
  ] );

  /*******/

  app.get( '/event/:eventUid/conversations/:conversationId/messages', [
    loadEvent(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.messages.list( {
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'event.uid'
      },
      limit: config.mw.limit
    } )
  ] );

  app.post( '/event/:eventUid/conversations/:conversationId/messages', [
    loadUser(),
    loadEvent(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.messages.create( {
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'event.uid',
        body: 'body.body',
        userUid: 'user.uid'
      }
    } )
  ] );

  app.post( '/event/:eventUid/conversations', [
    loadUser(),
    loadAgenda(),
    loadEvent(),
    // user OR agenda if it's an admin/modo
    ( req, res, next ) => {
      req.type = 'user';
      req.identifier = req.user.uid;
      req.creatorInboxUser = {
        userUid: req.user.uid
      };
      req.destinationInbox = {
        type: 'agenda',
        identifier: req.agenda.uid
      };
      req.conversationType = 'event'
      req.conversationParams = { des: { params: { juste: { pour: { dire: 'ok ?' } } } } };
      next();
    },
    inboxMw.conversations.create( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        destinationInbox: {
          type: 'destinationInbox.type',
          identifier: 'destinationInbox.identifier'
        },
        conversationType: 'conversationType',
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser'
      }
    } )
  ] );

  app.get( '/event/:eventUid/conversations', [
    loadEvent(),
    ( req, res, next ) => {
      req.type = 'agenda';
      next();
    },
    inboxMw.conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'event.uid'
      },
      limit: config.mw.limit
    } )
  ] );

  /*******/

  app.get( '/user/conversations', [
    loadUser(),
    inboxMw.user( 'user.uid' ).conversations.list( { limit: config.mw.limit } )
  ] );

  /*******/

  app.prettifyError( false );

  app.use( ( err, req, res, next ) => {
    if ( err.name === 'ValidationError' ) {
      return res.status( 400 ).json( err );
    }
    next( err );
  } );

  app.listen( port, () => {

    console.log( '==> App listening on port', port );

  } );

}

/*******/

function matchApp( req, res, next ) {

  const prefix = '/';
  const lang = req.query.lang || 'fr';
  const state = {
    settings: {
      prefix,
      lang,
      apiRoot: `http://localhost:${port}`,
      perPageLimit: config.mw.limit
    }
  };

  // Specific state for apps
  switch ( req.query._app ) {
    case 'agendaAdmin':
      _.merge( state, {
        res: {
          inboxHome: '/?_app=agendaAdmin',
          conversations: {
            create: '/agendaAdmin/conversations',
            list: '/agendaAdmin/conversations',
            action: '/agendaAdmin/conversations/:conversationId/action/:code'
          },
          messages: {
            list: '/agendaAdmin/conversations/:conversationId/messages',
            create: '/agendaAdmin/conversations/:conversationId/messages'
          }
        },
        agenda: req.agenda,
        event: req.event
      } );
      break;
    case 'user':
      _.merge( state, {
        res: {
          inboxHome: '/?_app=user',
          conversations: {
            list: '/user/conversations',
            action: '/user/conversations/:conversationId/action/:code'
          },
          messages: {
            list: '/user/conversations/:conversationId/messages',
            create: '/user/conversations/:conversationId/messages'
          }
        }
      } );
      break;
    case 'event':
    case 'conversationForm':
      return getApp( req, res, next );
  }

  if ( process.env.NO_SSR ) {
    return getApp( req, res, next, { store: { getState: () => state } } );
  }

  return mw.matchApp(
    { state },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  app.renderCanvas( {
    htmlContent: getHtmlBody( req )
  } )( req, res );

}

function getHtmlBody( req ) {

  switch ( req.query._app ) {
    case 'agendaAdmin':
      return (
        `<div class="container agenda-admin top-margined">
          <div class="row wsq">
            <div class="col col-sm-3 nav">
              <ul class="list-unstyled">
                <li class="menu-item js_menu_item js_menu_item_inbox selected">
                  <a class="active" href="/?_app=agendaAdmin">
                    <span>Messagerie</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="col-sm-9 body">
              <div class="inbox inbox-agenda-admin">
                <div class="js_canvas">{content}</div>
              </div>
            </div>
          </div>
        </div>`
      );
    case 'user':
      return (
        `<div class="container top-margined">
          <div class="row wsq">
            <div class="margin-all-sm">
              <div class="inbox inbox-user">
                <div class="js_canvas">{content}</div>
              </div>
            </div>
          </div>
        </div>`
      );
    case 'event':
      return (
        `<div>
          <div class="content">
            <div class="container">
              <div class="row">
                <section class="col-sm-7 col-sm-offset-1">
                  <div class="inbox inbox-event">
                    <div class="js_inbox_event"></div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>`
      );
    case 'conversationForm':
      return (
        `<h2>Conversation form</h2>
        <div
          class="js_conversation_form btn btn-link"
          data-type="contribution_request"
          data-destination-inbox="${_.escape( '{"type": "agenda", "identifier": 456789}' )}"
          data-lang="fr"
        >
          Cliquez ici ! (ou pas, je m'en fous après tout)
        </div>
        <div
          id="raw-conversation-form"
          class="btn btn-link"
          data-type="contribution_request"
          data-destination-inbox="${_.escape( '{"type": "agenda", "identifier": 456789}' )}"
          data-lang="fr"
        >
          Brut !
        </div>`
      );
    default:
      return (
        `<div class="js_canvas">{content}</div>`
      );
  }

}

function loadUser() {
  return ( req, res, next ) => {
    req.user = {
      uid: 99999999,
      id: 2,
      image: 'https://cibul.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    };
    next();
  };
}

function loadAgenda() {
  return ( req, res, next ) => {
    req.agenda = {
      id: 12288,
      uid: 90049545
    };
    next();
  };
}

function loadEvent() {
  return ( req, res, next ) => {
    req.event = {
      id: 45678,
      uid: 8798421
    };
    next();
  };
}
