const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../../testconfig.js' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const async = require( 'async' );

const agendasSvc = require( 'agendas/service/test' );
const aggregatorSourcesSvc = require( '../../service' );
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

const port = process.env.PORT || 3000;

fixtures.init( config );
agendasSvc.init( config );
aggregatorSourcesSvc.init( config );

app.use( morgan( 'combined' ) );

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  req.agenda = { id: 3480 };
  next();
} );

async.waterfall( [
  // agendasSvc.test.fixtures,
  wcb => fixtures( [ {
    table: 'review',
    src: __dirname + '/../fixtures/review.sql'
  }, {
    table: 'aggregator',
    src: __dirname + '/../fixtures/aggregator.sql'
  }, {
    table: 'aggregator_source',
    src: __dirname + '/../fixtures/aggregator_source.sql'
  } ], wcb )
], () => {

  app.get( '/sources.json', mw.list );
  app.get( '/remove', mw.remove );

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
      show: '#',
      remove: '/remove',
      search: '#',
      createAggregator: '#'
    },
    agenda: {
      uid: 48959239,
      slug: 'la-gargouille',
      title: 'La gargouille',
      isAggregator: true
    }
  };

  if ( process.env.NO_SSR ) {
    return getApp( req, res, next, { store: { getState: () => state } } );
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
    `<div class="container agenda-admin top-margined">
        <div class="row wsq">
          <div class="col col-sm-3 nav">
            <ul class="list-unstyled">
              <li class="menu-item js_menu_item js_menu_item_settings_sources selected">
                <a class="active" href="/">
                  <span>Sources</span>
                </a>
              </li>
              <li class="menu-item js_menu_item js_menu_item_settings_contribution">
                <a href="#">
                  <span>Contribution</span>
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
