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
const config = require( '../config' );

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

const userPreMw = [
  preMw,
  ( req, res, next ) => {
    req.type = 'user';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  }
];

userRouter.get( '/conversations/:conversationId/action/:code.json',
  userPreMw,
  inboxMw.conversations.action( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      code: 'params.code'
    }
  } ),
  errorHandler
);

userRouter.get( '/conversations/:conversationId/resume.json',
  userPreMw,
  inboxMw.conversations.resume( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid'
    }
  } ),
  errorHandler
);

userRouter.get( '/conversations/:conversationId/messages.json',
  userPreMw,
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid'
    },
    limit: 20
  } ),
  errorHandler
);

userRouter.post( '/conversations/:conversationId/messages.json',
  userPreMw,
  inboxMw.messages.create( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      body: 'body.body'
    }
  } ),
  errorHandler
);

userRouter.get( '/conversations.json',
  userPreMw,
  inboxMw.user( 'user.uid' ).conversations.list( { limit: 20 } ),
  ( req, res, next ) => {
    inboxMw.user( 'user.uid' ).conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'user.uid'
      },
      limit: req.query.limit || 20
    } )( req, res, next );
  },
  errorHandler
);

userRouter.post( '/conversations.json',
  userPreMw,
  ( req, res, next ) => {
    req.options = {
      // createInboxUserOnNull: true
    };
    next();
  },
  inboxMw.conversations.create( {
    namespaces: {
      type: 'type',
      identifier: 'user.uid',
      destinationInbox: 'body.destinationInbox',
      conversationType: 'body.type',
      conversationTypeIdentifier: 'body.typeIdentifier',
      params: 'body.params',
      message: 'body.message',
      creatorInboxUser: 'creatorInboxUser'
    }
  } ),
  errorHandler
);

userRouter.get( '/author.json',
  userPreMw,
  ( req, res ) => {
    // get inbox <-> conversation ==> inboxUser
    if ( req.query.conversationId ) {
      //
    }

    res.json( {
      inboxUser: {
        name: req.user.name,
        avatar: req.user.thumbnail || config.aws.defaultImagePath
      }
    } );
  },
  errorHandler
);

/* agenda */

const agendaRouter = express.Router( { mergeParams: true } );
app.use( '/agendas/:agendaUid/inbox', agendaRouter );

const agendaPreMw = [
  preMw,
  ( req, res, next ) => {
    req.type = 'agenda';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  },
  oldAgendaLoad( 'agendaUid', 'uid' ),
  cmn.checkAdminOrModerator,
  agendasMw.load( {
    namespaces: { identifiers: { uid: 'params.agendaUid' } },
    private: null
  } ),
  ( req, res, next ) => {
    if ( !req.agenda ) {
      res.status( 404 );
      return next( new VError( 'Agenda %s not found', req.params.agendaUid ) );
    }
    next();
  }
];

agendaRouter.get( '/conversations/:conversationId/action/:code.json',
  agendaPreMw,
  inboxMw.conversations.action( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: 'user.uid',
      code: 'params.code'
    }
  } ),
  errorHandler
);

agendaRouter.get( '/conversations/:conversationId/resume.json',
  agendaPreMw,
  inboxMw.conversations.resume( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: 'user.uid'
    }
  } ),
  errorHandler
);

agendaRouter.get( '/conversations/:conversationId/messages.json',
  agendaPreMw,
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: null
    },
    limit: 20
  } ),
  errorHandler
);

agendaRouter.post( '/conversations/:conversationId/messages.json',
  agendaPreMw,
  ( req, res, next ) => {
    req.options = {
      // createInboxUserOnNull: true
    };
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
  } ),
  errorHandler
);

agendaRouter.get( '/conversations.json',
  agendaPreMw,
  ( req, res, next ) => {
    inboxMw.conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid'
      },
      limit: req.query.limit || 20
    } )( req, res, next );
  },
  errorHandler
);

agendaRouter.post( '/conversations.json',
  agendaPreMw,
  ( req, res, next ) => {
    req.options = {
      // createInboxUserOnNull: true
    };
    next();
  },
  inboxMw.conversations.create( {
    namespaces: {
      type: 'type',
      identifier: 'agenda.uid',
      destinationInbox: 'body.destinationInbox',
      conversationType: 'body.type',
      conversationTypeIdentifier: 'body.typeIdentifier',
      params: 'body.params',
      message: 'body.message',
      creatorInboxUser: 'creatorInboxUser'
    }
  } ),
  errorHandler
);

agendaRouter.get( '/author.json',
  agendaPreMw,
  ( req, res, next ) => {
    inboxMw.inboxUser.get( {
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid'
      },
      fallbackGetter: () => ({
        name: req.user.name,
        avatar: req.user.thumbnail || config.aws.defaultImagePath
      })
    } )( req, res, next );
  },
  errorHandler
);

/* error handler */

function errorHandler( err, req, res, next ) {
  if ( err ) {
    if ( err.name === 'ValidationError' ) {
      return res.status( 400 ).json( err );
    }
    if ( err.code ) {
      res.status( err.code );
      return next( err );
    }
    errorLogger( 'middleware', err );
    res.status( 500 ).json( err );
  }
}
