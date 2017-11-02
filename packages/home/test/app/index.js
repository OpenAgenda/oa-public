const testApp = require( '@openagenda/test-app' );

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const morgan = require( 'morgan' );
const async = require( 'async' );
const _ = require( 'lodash' );
const fixtures = require( '@openagenda/fixtures' );
const homeMw = require( '../../middleware' );
const agendasSvc = require( 'agendas/service/test' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders/test/service' );
const eventsSvc = require( 'events-service/test/service' );
const config = require( '../../testconfig.js' );
const mw = require( '../../middleware' );

const helpers = require( '@openagenda/test-app/helpers' );
const app = testApp( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false,
  webpack: true
} );

const port = process.env.PORT || 3000;

homeMw.init( config );
fixtures.init( config );
agendasSvc.init( _.merge( {}, config, config.services.agendas ) );
// stakeholdersSvc.init( _.merge( {}, config, config.services.agendaStakeholders ) );
// eventsSvc.init( _.merge( {}, config, config.services.events ) );

app.use( morgan( 'combined' ) );

app.use( ( req, res, next ) => {
  req.user = {
    // id: 27696,
    // uid: 15723194
    id: 2,
    uid: 99999999
  };
  next();
} );

async.waterfall( [
  wcb => stakeholdersSvc.init( _.merge( {}, config, config.services.agendaStakeholders ), wcb ),
  wcb => fixtures( [ {
    table: 'review',
    src: __dirname + '/../fixtures/review.sql'
  }, {
    table: 'reviewer',
    src: __dirname + '/../fixtures/reviewer.sql'
  } ], wcb ),
  wcb => eventsSvc.initAndLoad( _.merge( {}, config, config.services.events ), [
    'event'
  ], { reset: false }, wcb )
  // wcb => stakeholdersSvc.initAndLoad( config, [
  //   'agenda',
  //   'stakeholder'
  // ], { reset: false }, wcb )
], () => {

  app.get( '/agendas.json', homeMw.agendas.list );
  app.get( '/events.json', homeMw.events.list );

  app.getAndListen( '*', port, matchApp );

} );


const getDefaultState = ( { lang, prefix } ) => ({
  settings: {
    prefix,
    lang,
    apiRoot: `http://localhost:${port}`,
    perPageLimit: config.mw.limit,
    isNew: false
  },
  res: {
    agendas: {
      create: '/new',
      list: '/agendas.json',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent'
    },
    events: {
      list: '/events.json',
      show: '/:slug/events/:eventSlug',
      showPrivate: '/:slug/events/:eventSlug.prv',
      showWithoutAgenda: '/events/:eventSlug'
    },
    messages: '/home/messages',
    notifs: '/home/notifications',
    moderate: '/:slug/admin',
    search: '/agendas'
  }
});

function matchApp( req, res, next ) {

  const lang = req.query.lang || 'fr';
  const prefix = '';

  mw.matchApp(
    { state: getDefaultState( { lang, prefix } ) },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  if ( res.headersSent ) return;

  if ( process.env.NO_SSR ) {
    req.data = { state: getDefaultState( { lang: req.query.lang || 'fr', prefix: '' } ) };
    return helpers.renderCanvas( true, false, '<div class="js_canvas">{content}</div>' )( req, res );
  }

  const state = store ? store.getState() : {};
  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, '<div class="js_canvas">{content}</div>' )( req, res );

}
