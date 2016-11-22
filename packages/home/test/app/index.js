const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../../testconfig.js' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );

const homeSvc = require( '../../service' );
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
homeSvc.init( config );

app.use( morgan( 'combined' ) );

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  next();
} );

fixtures( [ {
  table: 'review',
  src: __dirname + '/../fixtures/review.sql'
}, {
  table: 'reviewer',
  src: __dirname + '/../fixtures/reviewer.sql'
} ], () => {

  app.get( '/agendas', mw.agendas.list );

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
          limitPerPage: config.mw.limit
        },
        res: {
          list: '/agendas',
          new: '/new',
          events: '/home/events',
          messages: '/home/messages',
          notifs: '/home/notifications',
          moderate: '/:slug/admin',
          show: '/:slug',
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

  // Manually add prefix for react-router matching
  /* if ( state.routing && state.routing.locationBeforeTransitions ) {
    state.routing.locationBeforeTransitions.basename = prefix;
  } */

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, '<div class="js_canvas">{content}</div>' )( req, res );

}
