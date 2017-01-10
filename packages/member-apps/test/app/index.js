const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const path = require( 'path' );
const async = require( 'async' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const stakeholdersSvc = require( 'agenda-stakeholders/test/service' );
const usersSvc = require( 'users' );
const config = require( '../../testconfig.js' );

const mw = require( '../../middleware' )( stakeholdersSvc, config.mw );

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

const port = process.env.PORT || 3000;

fixtures.init( config );
usersSvc.init( config );

async.waterfall( [
  wcb => stakeholdersSvc.init/*AndLoad*/( config, wcb )/*,
  wcb => fixtures( [ {
    table: 'user',
    src: path.resolve( __dirname, '../fixtures/user.data.sql' )
  }, {
    table: 'api_key_set',
    src: path.resolve( __dirname, '../fixtures/api_key_set.data.sql' )
  } ], { reset: false }, wcb )*/
], () => {

  app.use( morgan( 'combined' ) );

  app.use( ( req, res, next ) => {
    req.user = { id: 2 };
    req.agenda = { id: 4608 };
    next();
  } );

  app.get( '/sources.json', mw.list );
  app.get( '/stats', mw.stats );

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
      list: '/sources.json',
      stats: '/stats',
      showContributor: '#'
    },
    agenda: {
      uid: 4608,
      slug: 'rdj2016',
      title: 'Rendez-vous aux Jardins 2016 [Officiel]',
      isAggregator: false,
      private: true,
      settings: {
        contribution: {
          type: 1
        }
      }
    }
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
