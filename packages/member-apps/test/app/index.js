const React = require( 'react' );
const _ = require( 'lodash' );
const ReactDOM = require( 'react-dom/server' );
const path = require( 'path' );
const async = require( 'async' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const agendasSvc = require( 'agendas/service/test' );
const { middleware: agendasMw, instanciate: instanciateAgenda } = require( 'agendas' );
const stakeholdersSvc = require( 'agenda-stakeholders/test/service' );
const stakeholdersMw = require( 'agenda-stakeholders/middleware' );
const usersSvc = require( 'users' );
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

app.use( bodyParser.urlencoded( { extended: false } ) );

// parse application/json
app.use( bodyParser.json() );

const port = process.env.PORT || 3000;

fixtures.init( config );
agendasSvc.init( config );
stakeholdersSvc.init( config );
usersSvc.init( config );

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
    req.user = { id: 2 }; // 2 == administrator, 4387 == contributor
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
      user: 'user',
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
    '/sources.json',
    stakeholdersMw.agenda( 'agenda.data' ).list( { detailed: true } ),
    ( { stakeholders, total }, res ) => res.json( { stakeholders, total } )
  );

  app.get(
    '/stats',
    stakeholdersMw.agenda( 'agenda.data' ).stats(),
    ( { stats }, res ) => res.json( { stats } )
  );

  app.get(
    '/remove/:uid',
    usersSvc.mw.load( 'params.uid', 'stakeholderUser' ),
    stakeholdersMw.agenda( 'agenda.data' ).get( {
      namespaces: {
        user: 'stakeholderUser',
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
    stakeholdersMw.agenda( 'agenda.data' ).remove( {
      namespaces: {
        user: 'stakeholderUser'
      }
    } ),
    ( { result }, res ) => res.status( !result.success ? 400 : 200 ).json( result )
  );

  app.post(
    '/update/:uid',
    usersSvc.mw.load( 'params.uid', 'stakeholderUser' ),
    stakeholdersMw.agenda( 'agenda.data' ).get( {
      namespaces: {
        user: 'stakeholderUser',
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
        user: 'stakeholderUser',
        data: 'body'
      },
      credential: true
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
    stakeholdersMw.agenda( 'agenda.data' ).bulk( {
      namespaces: {
        data: 'body'
      },
      allowPartial: true
    } ),
    ( req, res, next ) => {

      const { queued } = req.result;
      const [ errors, results ] = _.unzip( req.result.results ).map( _.compact );

      if ( errors.length ) return next( { errors } );

      const emailsRejected = results.reduce( ( prev, nextResult, i ) => {
        if ( nextResult.errors && nextResult.errors.length ) {
          return prev.concat( req.body.stakeholders[ i ].email );
        }
        return prev;
      }, [] );

      req.result = { queued, emailsRejected, success: !emailsRejected.length };

      next();

    },
    ( { result }, res ) => {
      const status = (result.errors && result.errors.length) || !result.success ? 400 : 200;
      res.status( status ).json( result )
    }
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
      list: '/sources.json',
      update: '/update/:uid',
      remove: '/remove/:uid',
      invite: '/invite',
      stats: '/stats',
      showContributor: '#',
      writeToMember: '#'
    },
    agenda: {
      uid: 4608,
      slug: 'rdj2016',
      title: 'Rendez-vous aux Jardins 2016 [Officiel]',
      roles: req.agendaRoles
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
