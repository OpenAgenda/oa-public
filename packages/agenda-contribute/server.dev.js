"use strict";

process.env.NODE_ENV = 'development';

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
  layout: devLayout,
  redirects: {
    seeEvent: '/?redirect.eventCreated=:eventUid',
    createOtherEvent: '/?redirect.createOtherEvent',
    seeAllEvents: '/?redirect.seeAllEvents',
    contactAdministrators: '/?redirect.contactAdministrators'
  },
  middlewares: {
    user: require( './dev/loadUserMw' ),
    agenda: require( './dev/loadAgendaMw' ),
    member: require( './dev/loadMemberMw' ),
    event: require( './dev/loadEventMw' ),
    config: require( './dev/loadConfigMw' )
  },
  interfaces: {
    setMember: require( './dev/setMember' ),
    setEvent: require( './dev/setEvent' )
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

//dev.get( '/', ( req, res ) => res.redirect( 302, '/jep-2018-occitanie/contribute' ) );

dev.use( '/locations', locationApp );

dev.use( '/:agendaSlug/contribute', service.app );

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.use( '/fonts', express.static( __dirname + '/../bs-templates/templates/fonts' ) );

dev.listen( 3000 );
