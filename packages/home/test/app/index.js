const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../../testconfig.js' );

const mw = require( '../../middleware/index' );

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

function matchApp( req, res, next ) {

  const prefix = '';
  const lang = req.lang || 'fr';

  mw.matchApp(
    {
      state: {
        settings: { prefix, lang, apiRoot: `http://localhost:${port}` },
        res: {}
      }
    },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  const prefix = '';
  const state = store ? store.getState() : {};

  // Manually add prefix for react-router matching
  if ( state.routing && state.routing.locationBeforeTransitions ) {
    state.routing.locationBeforeTransitions.basename = prefix;
  }

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, '<div class="js_canvas">{content}</div>' )( req, res );

}

app.getAndListen( '*', port, matchApp );
