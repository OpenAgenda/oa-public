global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import bodyParser from 'body-parser';
import inboxesSvc from '@openagenda/inboxes';
import * as inboxMw from '@openagenda/inboxes/dist/middleware';
import testconfig from './testconfig';

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  (async () => {
    inboxesSvc.init( testconfig );
    inboxMw.init( testconfig );
  })();
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );


function loadUser() {
  return ( req, res, next ) => {
    req.user = {
      uid: 99999999,
      id: 2,
      name: 'Romain Lange',
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
    limit: testconfig.mw.limit
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
    limit: testconfig.mw.limit
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
    limit: testconfig.mw.limit
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
    limit: testconfig.mw.limit
  } )
] );

/*******/

app.get( '/user/conversations/:conversationId/messages', [
  loadUser(),
  ( req, res, next ) => {
    req.type = 'user';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  },
  inboxMw.messages.list( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid'
    },
    limit: 20
  } )
] );

app.post( '/user/conversations/:conversationId/messages', [
  loadUser(),
  ( req, res, next ) => {
    req.type = 'user';
    req.creatorInboxUser = { userUid: req.user.uid };
    next();
  },
  inboxMw.messages.create( {
    namespaces: {
      conversationId: 'params.conversationId',
      type: 'type',
      identifier: 'user.uid',
      userUid: 'user.uid',
      body: 'body.body'
    }
  } )
] );

app.get( '/user/conversations', [
  loadUser(),
  inboxMw.user( 'user.uid' ).conversations.list( { limit: testconfig.mw.limit } )
] );

app.get( '/user/author.json',
  loadUser(),
  ( req, res ) => {
    res.json( {
      inboxUser: {
        name: req.user.name,
        avatar: req.user.thumbnail || testconfig.aws.defaultImagePath
      }
    } );
  }
);

/*******/

app.use( errorHandler( { log: true } ) );

if ( process.env.NODE_ENV !== 'test' ) {
  server.listen( process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Dev server started on => http://localhost:${server.address().port}/`
    );
  } );
}

export default app;
