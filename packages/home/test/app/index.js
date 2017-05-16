const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const morgan = require( 'morgan' );
const async = require( 'async' );
const fixtures = require( 'fixtures' );
const homeMw = require( '../../middleware' );
const agendasSvc = require( 'agendas/service/test' );
const stakeholdersSvc = require( 'agenda-stakeholders/test/service' );
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

const port = process.env.PORT || 3000;

homeMw.init( config );
fixtures.init( config );
agendasSvc.init( config );
stakeholdersSvc.init( config );

app.use( morgan( 'combined' ) );

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  next();
} );

async.waterfall( [
  wcb => fixtures( [ {
    table: 'review',
    src: __dirname + '/../fixtures/review.sql'
  }, {
    table: 'reviewer',
    src: __dirname + '/../fixtures/reviewer.sql'
  } ], wcb ),
  // wcb => stakeholdersSvc.initAndLoad( config, [
  //   'agenda',
  //   'stakeholder'
  // ], { reset: false }, wcb )
], () => {

  app.get( '/agendas', homeMw.agendas.list );

  app.getAndListen( '*', port, matchApp );

} );


function matchApp( req, res, next ) {

  const prefix = '/';
  const lang = req.query.lang || 'fr';

  mw.matchApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${port}`,
          perPageLimit: config.mw.limit
        },
        res: {
          list: '/agendas',
          new: '/new',
          events: '/home/events',
          messages: '/home/messages',
          notifs: '/home/notifications',
          moderate: '/:slug/admin',
          show: '/:slug',
          showPrivate: '/:slug.prv',
          addEvent: '/:slug/addevent',
          search: '/agendas'
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  // const prefix = '/home';
  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, '<div class="js_canvas">{content}</div>' )( req, res );

}
