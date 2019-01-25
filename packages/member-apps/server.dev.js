global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import _ from 'lodash';
import usersSvc from '@openagenda/users';
import agendasSvc, { middleware as agendasMw } from '@openagenda/agendas';
import stakeholdersSvc from '@openagenda/agenda-stakeholders';
import stakeholdersMw from '@openagenda/agenda-stakeholders/dist/middleware';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  usersSvc.init( testconfig );
  agendasSvc.init( testconfig );
  stakeholdersSvc.init( testconfig, () => {
    stakeholdersSvc.tasks.message();
  } );
}

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

app.use( agendasMw.load( {
  namespaces: {
    identifiers: {
      id: 'agenda.id' // slug with req.params.slug in real world
    }
  },
  instanciate: true,
  internal: true
} ) );

app.use( stakeholdersMw.agenda( 'agenda.data' ).get( {
  namespaces: {
    stakeholder: 'stakeholder',
    instance: 'stakeholderInstance'
  }
} ) );

app.use( agendasMw.loadRoles( {
  namespaces: {
    agenda: 'agenda', // slug with req.params.slug in real world
    result: 'agendaRoles'
  }
} ) );

app.get(
  '/members.json',
  stakeholdersMw.agenda( 'agenda.data' ).list( { total: true, detailed: true } ),
  ( req, res, next ) => {
    req.stakeholders = req.stakeholders.map( s => {
      s.invited = !s.userId && !s.deletedUser;
      s.owner = s.userId === req.user.id;
      return _.omit( s, 'userId', 'user.id' );
    } );
    next();
  },
  ( { stakeholders, total }, res ) => res.json( { stakeholders, total } )
);

app.get(
  '/stats',
  stakeholdersMw.agenda( 'agenda.data' ).stats(),
  ( { stats }, res ) => res.json( { stats } )
);

app.get(
  '/remove/:id',
  ( req, res, next ) => {
    req.identifiers = { id: req.params.id };
    next();
  },
  stakeholdersMw.agenda( 'agenda.data' ).get( {
    namespaces: {
      stakeholder: 'stakeholderToUse',
      instance: 'stakeholderInstanceToUse'
    }
  } ),
  ( req, res, next ) => {
    if ( req.stakeholder.credential === 3 && [ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
      return next( new Error( 'You don\'t have right to remove this stakeholder' ) );
    }
    next();
  },
  stakeholdersMw.agenda( 'agenda.data' ).remove(),
  ( { result }, res ) => res.status( !result.success ? 400 : 200 ).json( result )
);

app.post(
  '/update/:id',
  ( req, res, next ) => {
    req.identifiers = { id: req.params.id };
    next();
  },
  stakeholdersMw.agenda( 'agenda.data' ).get( {
    namespaces: {
      stakeholder: 'stakeholderToUse',
      instance: 'stakeholderInstanceToUse'
    }
  } ),
  ( req, res, next ) => {
    if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.stakeholderToUse.credential ) ) {
      return next();
    }
    next( new Error( 'You don\'t have right to update this stakeholder' ) );
  },
  stakeholdersMw.agenda( 'agenda.data' ).update( {
    namespaces: {
      data: 'body'
    },
    credential: true,
    allowPartial: true
  } ),
  ( { result }, res ) => res.status( result.errors.length ? 400 : 200 ).json( result )
);

app.post(
  '/invite',
  ( req, res, next ) => {
    if ( req.stakeholder.credential !== 3 || ![ 2, 3 ].includes( req.body.credential ) ) {
      return next();
    }
    next( new Error( 'You don\'t have right to invite members with this role' ) );
  },
  ( req, res, next ) => {
    req.context = {
      lang: req.user.lang
    }
    next();
  },
  stakeholdersMw.agenda( 'agenda.data' ).bulk( {
    namespaces: {
      data: 'body',
      context: 'context'
    },
    allowPartial: true
  } ),
  ( req, res, next ) => {

    const { queued } = req.result;
    const [ errors, results ] = _.unzip( req.result.results ).map( _.compact );

    if ( errors && errors.length ) {
      return res.status( 400 ).json( { errors } );
    }

    const emailsRejected = _.compact( (results || []).reduce( ( prev, nextResult, i ) => {
      let emailRejected;
      if ( nextResult.errors && nextResult.errors.length ) {
        emailRejected = nextResult.errors.reduce( ( prev, nextError ) => {
          return (nextError.code && req.body.stakeholders[ i ].email) || null;
        }, null );
      }
      return prev.concat( emailRejected );
    }, [] ) );

    req.result = { queued, emailsRejected, success: !emailsRejected.length };

    next();

  },
  ( { result }, res ) => {
    const status = (result.errors && result.errors.length) || !result.success ? 400 : 200;
    res.status( status ).json( result );
  }
);

app.post(
  '/send-message',
  ( req, res, next ) => {
    req.context = {
      lang: req.user.lang,
      replyTo: req.body.replyTo
    };
    next();
  },
  ( req, res, next ) => stakeholdersMw.agenda( 'agenda.data' ).message( {
    namespaces: {
      message: 'body.message'
    },
    actionsCounterEqualZero: req.query.inactive ? true : null
  } )( req, res, next ),
  ( { result }, res ) => res.status( result.errors && result.errors.length ? 400 : 200 ).json( result )
);

app.post(
  '/send-a-message/:id',
  ( req, res, next ) => {
    req.context = {
      lang: req.user.lang,
      replyTo: req.body.replyTo
    };
    next();
  },
  ( req, res, next ) => stakeholdersMw.agenda( 'agenda.data' ).message( {
    namespaces: {
      message: 'body.message'
    },
    id: parseInt( req.params.id ) || 0
  } )( req, res, next ),
  ( { result }, res ) => res.status( result.errors && result.errors.length ? 400 : 200 ).json( result )
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
