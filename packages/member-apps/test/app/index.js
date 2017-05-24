const React = require( 'react' );
const _ = require( 'lodash' );
const ReactDOM = require( 'react-dom/server' );
const path = require( 'path' );
const async = require( 'async' );
const express = require( 'express' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const agendasSvc = require( 'agendas/service/test' );
const { middleware: agendasMw } = require( 'agendas' );
const stakeholdersSvc = require( 'agenda-stakeholders/test/service' );
const stakeholdersMw = require( 'agenda-stakeholders/middleware' );
const bodyParser = require( 'body-parser' );
const config = require( '../../testconfig.js' );

const mw = require( '../../middleware' );

const helpers = require( 'test-app/helpers' );
const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false,
  webpack: true
} );

app.use( '/js', express.static( path.dirname( require.resolve( 'react-form-components/test/app' ) ) + '/js' ) );

app.use( bodyParser.urlencoded( { extended: false } ) );

// parse application/json
app.use( bodyParser.json() );

const port = process.env.PORT || 3000;

fixtures.init( config );
agendasSvc.init( config );
stakeholdersSvc.init( config, () => {

  stakeholdersSvc.tasks.message();

} );

async.waterfall( [
  // wcb => agendasSvc.test.fixtures( [
  //   'occurrence',
  //   'legacy_credential_set'
  // ], { reset: true }, wcb ),
  // wcb => stakeholdersSvc.initAndLoad( config, { reset: false }, wcb ),
  // wcb => fixtures( [ {
  //   table: 'user',
  //   src: path.resolve( __dirname, '../fixtures/user.data.sql' )
  // }, {
  //   table: 'api_key_set',
  //   src: path.resolve( __dirname, '../fixtures/api_key_set.data.sql' )
  // } ], { reset: false }, wcb )
], () => {

  app.use( morgan( 'combined' ) );

  app.use( ( req, res, next ) => {
    req.user = {
      id: 2,
      lang: req.query.lang || 'fr'
    }; // 2 == administrator, 4387 == contributor
    req.identifiers = { userId: req.user.id };
    req.agenda = { id: 4608 };
    next();
  } );

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
    stakeholdersMw.agenda( 'agenda.data' ).list( { detailed: true } ),
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

      if ( errors.length ) return next( { errors } );

      const emailsRejected = _.compact( results.reduce( ( prev, nextResult, i ) => {
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
    ( req, res, next ) => stakeholdersMw.agenda( 'agenda.data' ).message( {
      namespaces: {
        message: 'body.message'
      },
      actionsCounterEqualZero: req.query.inactive ? true : null
    } )( req, res, next ),
    ( { result }, res ) => res.status( result.errors && result.errors.length ? 400 : 200 ).json( result )
  );

  app.getAndListen( '*', port, matchApp );

} );


function matchApp( req, res, next ) {

  const prefix = '/';
  const lang = req.query.lang || 'fr';
  const state = {
    settings: {
      prefix,
      lang,
      apiRoot: `http://localhost:${port}`,
      perPageLimit: config.mw.limit
    },
    res: {
      app: '#',
      list: '/members.json',
      update: '/update/:id',
      remove: '/remove/:id',
      invite: '/invite',
      stats: '/stats',
      showContributor: '#',
      writeToMember: '#', // old chat
      sendMessage: '/send-message'
    },
    agenda: {
      uid: req.agenda.data.uid,
      slug: req.agenda.data.slug,
      title: req.agenda.data.title,
      ownerId: req.agenda.data.ownerId,
      roles: req.agendaRoles,
      credentials: {
        invitationMessage: true
      }
    },
    stakeholder: req.stakeholder
  };

  if ( process.env.NO_SSR ) {
    return getApp( req, res, next, {
      store: { getState: () => state }
    } );
  }

  mw.matchApp(
    { state },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, getHtmlBody() )( req, res );

}

function getHtmlBody() {

  return (
    `<div class="container members top-margined">
        <div class="row wsq">
          <div class="col col-sm-3 nav">
            <ul class="list-unstyled">
              <li class="menu-item js_menu_item js_menu_item_settings_members selected">
                <a class="active" href="/">
                  <span>Membres</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="col-sm-9 body">
            <div class="js_canvas">{content}</div>
          </div>
        </div>
      </div>`
  );

}
