"use strict";

const express = require( 'express' );
const morgan = require( 'morgan' );
const VError = require( 'verror' );
const inboxMw = require( '@openagenda/inboxes/dist/middleware' );
const sessions = require( '@openagenda/sessions' );
const agendasMw = require( '@openagenda/agendas/middleware' );
const { mw: { load: oldAgendaLoad } } = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const errorLogger = require( '../services/00_errors' );
const config = require( '../config' );


const agendaRouter = express.Router( { mergeParams: true } );

module.exports = agendaRouter;


if ( __DEVELOPMENT__ ) {
  agendaRouter.use( morgan( 'dev' ) );
}

const preMw = [
  cmn.loadLogger( 'inboxes/back' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
  sessions.middleware.load( { detailed: true } ),
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
  preMw,
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
  preMw,
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
  preMw,
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: 'user.uid'
    },
    limit: 20
  } ),
  errorHandler
);

agendaRouter.post( '/conversations/:conversationId/messages.json',
  preMw,
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
  preMw,
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

agendaRouter.use( '/conversations/:conversationId/prepare-attachment',
  preMw,
  inboxMw.messages.prepareAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
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

agendaRouter.use( '/conversations/:conversationId/add-attachment',
  preMw,
  inboxMw.messages.addAttachment( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'agenda.uid',
      userUid: 'user.uid',
      messageId: 'query.messageId',
      filename: 'query.filename',
      originalName: 'query.originalName'
    }
  } ),
  errorHandler
);

agendaRouter.get( '/author.json',
  preMw,
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
