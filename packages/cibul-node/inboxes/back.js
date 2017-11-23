"use strict";

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const VError = require( 'verror' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const sessions = require( '@openagenda/sessions' );
const agendasMw = require( '@openagenda/agendas/middleware' );
const { mw: { load: oldAgendaLoad } } = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const errorLogger = require( '../services/00_errors' );

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
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  } );

userRouter.get( '/conversations/:conversationId/action/:code.json',
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

userRouter.get( '/conversations/:conversationId/messages.json',
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid'
    },
    limit: 20
  } )
);

userRouter.post( '/conversations/:conversationId/messages.json',
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

userRouter.get( '/conversations.json',
  inboxMw.user( 'user.uid' ).conversations.list( { limit: 20 } ),
  ( req, res, next ) => {
    inboxMw.user( 'user.uid' ).conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'user.uid'
      },
      limit: req.query.limit || 20
    } )( req, res, next );
  }
);

userRouter.post( '/conversations.json',
  ( req, res, next ) => {
    req.options = {
      createInboxUserOnNull: true
    };
    next();
  },
  inboxMw.conversations.create( {
    namespaces: {
      type: 'type',
      identifier: 'user.uid',
      destinationInbox: {
        type: 'body.destinationInbox.type',
        identifier: 'body.destinationInbox.identifier'
      },
      conversationType: 'body.type',
      conversationTypeIdentifier: 'body.typeIdentifier',
      params: 'body.params',
      message: 'body.message',
      creatorInboxUser: 'creatorInboxUser'
    }
  } )
);

userRouter.get( '/author.json',
  ( req, res ) => {
    res.json( {
      inboxUser: {
        name: req.user.name,
        avatar: req.user.thumbnail
      }
    } );
  }
);

userRouter.use( errorHandler );

/* agenda */

const agendaRouter = express.Router( { mergeParams: true } );
app.use( '/agendas/:agendaUid/inbox', agendaRouter );

agendaRouter
  .use( preMw )
  .use( ( req, res, next ) => {
    req.type = 'agenda';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  } )
  .use( oldAgendaLoad( 'agendaUid', 'uid' ) )
  .use( cmn.checkAdminOrModerator )
  .use( agendasMw.load( {
    namespaces: { identifiers: { uid: 'params.agendaUid' } },
    private: null
  } ) )
  .use( ( req, res, next ) => {
    if ( !req.agenda ) {
      res.status( 404 );
      return next( new VError( 'Agenda %s not found', req.params.agendaUid ) );
    }
    next();
  } );

agendaRouter.get( '/conversations/:conversationId/action/:code.json',
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

agendaRouter.get( '/conversations/:conversationId/messages.json',
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid'
    },
    limit: 20
  } )
);

agendaRouter.post( '/conversations/:conversationId/messages.json',
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

agendaRouter.get( '/conversations.json',
  ( req, res, next ) => {
    inboxMw.conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid'
      },
      limit: req.query.limit || 20
    } )( req, res, next );
  }
);

agendaRouter.post( '/conversations.json',
  ( req, res, next ) => {
    req.options = {
      createInboxUserOnNull: true
    };
    next();
  },
  inboxMw.conversations.create( {
    namespaces: {
      type: 'type',
      identifier: 'agenda.uid',
      destinationInbox: {
        type: 'body.destinationInbox.type',
        identifier: 'body.destinationInbox.identifier'
      },
      conversationType: 'body.type',
      conversationTypeIdentifier: 'body.typeIdentifier',
      params: 'body.params',
      message: 'body.message',
      creatorInboxUser: 'creatorInboxUser'
    }
  } )
);

agendaRouter.get( '/author.json',
  ( req, res, next ) => {
    inboxMw.inboxUser.get( {
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid'
      },
      fallbackGetter: () => ({
        name: req.user.name,
        avatar: req.user.thumbnail
      })
    } )( req, res, next );
  }
);

agendaRouter.use( errorHandler );

/* error handler */

function errorHandler( err, req, res, next ) {
  if ( err.name === 'ValidationError' ) {
    return res.status( 400 );
  }
  errorLogger( 'middleware', err );
  res.status( 500 ).json( err );
}
