"use strict";

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const errorLogger = require( '../services/00_errors' );
const config = require( '../config' );


const userRouter = express.Router( { mergeParams: true } );

module.exports = userRouter;


if ( __DEVELOPMENT__ ) {
  userRouter.use( morgan( 'dev' ) );
}

const preMw = [
  cmn.loadLogger( 'inboxes/back' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
  sessions.middleware.load( { detailed: true } ),
  bodyParser.urlencoded( { extended: true } ),
  bodyParser.json(),
  ( req, res, next ) => {
    req.type = 'user';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  }
];

userRouter.get( '/conversations/:conversationId/action/:code.json',
  preMw,
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
  preMw,
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
  preMw,
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
  preMw,
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
  preMw,
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
  preMw,
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
  preMw,
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
