"use strict";

const express = require( 'express' );
const morgan = require( 'morgan' );
const inboxMw = require( '@openagenda/inboxes/dist/middleware' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const errorLogger = require( '../services/00_errors' );
const config = require( '../config' );


const userRouter = express.Router( { mergeParams: true } );

module.exports = userRouter;


const preMw = [
  cmn.loadLogger( 'inboxes/back' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
  sessions.middleware.load( { detailed: true } ),
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

userRouter.use( '/conversations/:conversationId/prepare-attachment',
  preMw,
  inboxMw.messages.prepareAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      messageId: 'query.meta.messageId'
    },
    uppyOptions: {
      providerOptions: {
        s3: {
          key: config.aws.accessKeyId,
          secret: config.aws.secretAccessKey,
          bucket: config.aws.bucket,
          region: config.aws.region
        }
      },
      server: {
        host: config.domain,
        protocol: 'https'
      },
      secret: config.uppy.secret,
      debug: false
    }
  } ),
  errorHandler
);

userRouter.use( '/conversations/:conversationId/add-attachment',
  preMw,
  inboxMw.messages.addAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      messageId: 'query.messageId',
      filename: 'query.filename',
      originalName: 'query.originalName'
    }
  } ),
  errorHandler
);

userRouter.get( '/download-attachment',
  inboxMw.messages.downloadAttachment( {
    namespaces: {
      id: 'query.id',
      filename: 'query.filename'
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
    res.status( res.statusCode || 500 ).json( err );
  }
}
