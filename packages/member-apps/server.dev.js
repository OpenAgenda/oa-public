global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import _ from 'lodash';
import http from 'http';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';

import memberListResult from './fixtures/members.json';

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.user = {
    id: 2,
    lang: req.query.lang || 'fr'
  }; // 2 == administrator, 4387 == contributor
  req.identifiers = { userId: req.user.id };
  req.agenda = { id: 4608 };
  next();
} );

/********/

app.use( ( req, res, next ) => {
  req.agenda = {
    uid: 1938,
    title: 'Un agenda'
  }
  next();
} );

app.use( ( req, res, next ) => {
  req.member = {
    id: 1,
    userUid: 123,
    agendaUid: 1234,
    custom: {
    }
  }
  next();
} )

app.use( function loadRoles( req, res, next ) {
  req.roles = [ {
    code: 1,
    slug: 'contributor'
  }, {
    code: 2,
    slug: 'administrator'
  }, {
    code: 3,
    slug: 'moderator'
  } ];
  next();
} );

app.get(
  '/members.json',
  ( req, res, next ) => {
    res.json( memberListResult );
  } );

app.get(
  '/stats',
  ( req, res ) => res.json( {
    total: 17,
    totalPerRole: {
      contributor: 14,
      administrator: 3
    }
  } )
);

app.delete(
  '/remove/:id',
  ( req, res, next ) => {
    req.result = { success: true };
    next();
  },
  ( { result }, res ) => res.status( !result.success ? 400 : 200 ).json( result )
);

app.patch(
  '/update/:id',
  ( req, res, next ) => {
    req.result = {
      role: 2,
      custom: {
        contactName: 'Server result member name',
        organization: 'Members Org'
      },
      errors: []
    };
    next();
  },
  ( { result }, res ) => res.status( result.errors.length ? 400 : 200 ).json( result )
);

app.post(
  '/invite',
  ( req, res, next ) => {
    res.json( { queued: true, emailsRejected: [], success: true } );
  }
);

app.post(
  '/send-message',
  ( req, res, next ) => res.json( { success: true } )
);

app.post(
  '/send-a-message/:id',
  ( req, res, next ) => {
    res.json( { success: true } );
  }
);

/********/

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
