"use strict";

const express = require( 'express' );
const inboxMw = require( '@openagenda/inboxes/dist/middleware' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const errorLogger = require( '../services/00_errors' );
const config = require( '../config' );


const supportRouter = express.Router( { mergeParams: true } );

module.exports = supportRouter;


const preMw = [
  cmn.loadLogger( 'inboxes/back' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
  ( req, res, next ) => {
    req.type = 'support';
    req.identifier = 1;
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  },
  cmn.requireSuperAdmin
];

supportRouter.get( '/conversations/:conversationId/action/:code.json',
  preMw,
  inboxMw.conversations.action( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
      userUid: 'user.uid',
      code: 'params.code'
    }
  } ),
  errorHandler
);

supportRouter.get( '/conversations/:conversationId/resume.json',
  preMw,
  inboxMw.conversations.resume( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
      userUid: 'user.uid'
    }
  } ),
  errorHandler
);

supportRouter.get( '/conversations/:conversationId/messages.json',
  preMw,
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
      userUid: null
    },
    limit: 20
  } ),
  errorHandler
);

supportRouter.post( '/conversations/:conversationId/messages.json',
  preMw,
  inboxMw.messages.create( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
      body: 'body.body',
      userUid: 'user.uid'
    }
  } ),
  errorHandler
);

supportRouter.get( '/conversations.json',
  preMw,
  ( req, res, next ) => {
    inboxMw.conversations.list( {
      namespaces: {
        type: 'type',
        identifier: 'identifier'
      },
      limit: req.query.limit || 20
    } )( req, res, next );
  },
  errorHandler
);

supportRouter.post( '/conversations.json',
  preMw,
  inboxMw.conversations.create( {
    namespaces: {
      type: 'type',
      identifier: 'identifier',
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

supportRouter.use( '/conversations/:conversationId/prepare-attachment',
  preMw,
  inboxMw.messages.prepareAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
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

supportRouter.use( '/conversations/:conversationId/add-attachment',
  preMw,
  inboxMw.messages.addAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'identifier',
      userUid: 'user.uid',
      messageId: 'query.messageId',
      filename: 'query.filename',
      originalName: 'query.originalName'
    }
  } ),
  errorHandler
);

supportRouter.get( '/author.json',
  preMw,
  ( req, res, next ) => {
    inboxMw.inboxUser.get( {
      namespaces: {
        type: 'type',
        identifier: 'identifier'
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

    res.status( res.statusCode === 200 ? 500 : res.statusCode ).json( err );
  }
}
