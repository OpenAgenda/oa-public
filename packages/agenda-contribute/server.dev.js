"use strict";

process.env.NODE_ENV = 'development';
process.env.TMP_FOLDER = __dirname + '/dev/tmp';

const _ = require( 'lodash' );

const express = require( 'express' );
const webpack = require( 'webpack' );

const webpackConfig = require( './webpack.dev' );
const scenarios = require( './scenarios.dev' );
const compiler = webpack( webpackConfig );

const dev = express();

const locationApp = require( '@openagenda/event-form/dev/locationApp' );

const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

const service = require( './' );

const devLayout = require( './dev/layout' );

service.init( {
  //frontAppPath: '/dist', //set only to troubleshoot dist file
  layout: devLayout,
  interfaces: {
    setMember: require( './dev/setMember' ),
    setEvent: require( './dev/setEvent' ),
    generateUniqueFileKey: require( './dev/generateUniqueFileKey' )
  }
} )

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.get( '/', ( req, res ) => {

  res.send( devLayout( req, '<div class="container margin-top-lg">' +
    _.chunk( scenarios, 4 ).map( chunk => '<div class="row">' +
      chunk.map( scenario => `
        <div class="col-md-3">
          <div class="wsq padding-all-sm margin-all-sm">
            <label>${scenario.agenda.title}</label>
            <p>${scenario.agenda.description}</p>
            <a href="${scenario.link || '/' + scenario.agenda.slug + '/contribute'}">Open</a>
          </div>
        </div>
      ` ).join( '' ) + 
    '</div>' ).join( '' ) + '</div>' 
  ) );

} );


dev.use( '/locations', locationApp );

dev.all( 
  [ 
    '/:agendaSlug/contribute', 
    '/:agendaSlug/contribute/:step', 
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
  ],
  require( './dev/loadUserMw' ),
  require( './dev/loadAgendaMw' ),
  require( './dev/loadMemberMw' )
);

dev.all( [ 
  '/:agendaSlug/contribute/event/:eventUid',
  '/:agendaSlug/contribute/event/:eventUid/draft'
], require( './dev/loadEventMw' ) );

dev.all( [
  '/:agendaSlug/contribute',
  '/:agendaSlug/contribute/:step',
  '/:agendaSlug/contribute/event/:eventUid',
  '/:agendaSlug/contribute/event/:eventUid/draft'
], require( './dev/loadConfigMw' ) );


// useful only if frontAppPath is given to service at init
dev.use( '/dist', 
  service.dist, 
  ( req, res, next ) => res.send( 404 ) // if not, unhandled files will be handled by following routes
);


dev.use( '/:agendaSlug/contribute', service.app );

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.use( '/fonts', express.static( __dirname + '/../bs-templates/templates/fonts' ) );

dev.listen( 3000 );
