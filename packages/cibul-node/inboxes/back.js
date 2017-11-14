"use strict";

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const VError = require( 'verror' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const sessions = require( '@openagenda/sessions' );
const agendasMw = require( 'agendas/middleware' );
const { mw: { load: oldAgendaLoad } } = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );

const app = express();

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

const preMw = [
  cmn.loadLogger( 'inboxes/back' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
  sessions.middleware.load( { detailed: true } ),
  bodyParser.urlencoded( { extended: true } ),
  bodyParser.json()
];

if ( __DEVELOPMENT__ ) {
  preMw.push( morgan( 'dev' ) );
}

/* user */

const userRouter = express.Router( { mergeParams: true } );
app.use( '/home/inbox', userRouter );

userRouter
  .use( preMw )
  .use( ( req, res, next ) => {
    req.type = 'user';
    next();
  } );

userRouter.get( '/conversations/:conversationId/action/:code',
  inboxMw.conversations.action( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      code: 'params.code'
    }
  } )
);

userRouter.get( '/conversations/:conversationId/messages',
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid'
    },
    limit: 20
  } )
);

userRouter.post( '/conversations/:conversationId/messages',
  inboxMw.messages.create( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      body: 'body.body'
    }
  } )
);

userRouter.get( '/conversations',
  inboxMw.user( 'user.uid' ).conversations.list( { limit: 20 } )
);

/* agendaAdmin */

const agendaAdminRouter = express.Router( { mergeParams: true } );
app.use( '/:slug/admin/inbox', agendaAdminRouter );

agendaAdminRouter
  .use( preMw )
  .use( ( req, res, next ) => {
    req.type = 'agenda';
    next();
  } )
  .use( oldAgendaLoad( 'slug' ) )
  .use( cmn.checkAdminOrModerator )
  .use( agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ) )
  .use( ( req, res, next ) => {
    if ( !req.agenda ) {
      res.status( 404 );
      return next( new VError( 'Agenda %s not found', req.params.agendaUid ) );
    }
    next();
  } );

agendaAdminRouter.get( '/conversations/:conversationId/action/:code',
  inboxMw.conversations.action( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: 'user.uid',
      code: 'params.code'
    }
  } )
);

agendaAdminRouter.get( '/conversations/:conversationId/messages',
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid'
    },
    limit: 20
  } )
);

agendaAdminRouter.post( '/conversations/:conversationId/messages',
  inboxMw.messages.create( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      body: 'body.body',
      userUid: 'user.uid'
    }
  } )
);

agendaAdminRouter.get( '/conversations',
  inboxMw.conversations.list( {
    namespaces: {
      type: 'type',
      identifier: 'agenda.uid'
    },
    limit: 20
  } )
);

/* error handler */

app.use( ( err, req, res, next ) => {
  if ( err.name === 'ValidationError' ) {
    return res.status( 400 ).json( err );
  }
  next( err );
} );
