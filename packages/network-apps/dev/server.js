"use strict";

process.env.NODE_ENV = 'development';

const _ = require( 'lodash' );

const express = require( 'express' );
const webpack = require( 'webpack' );

const webpackConfig = require( './webpack' );

const compiler = webpack( webpackConfig );

const dev = express();

const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

const Service = require( '../' );

const devLayout = require( './layout' );

Service.router.setLayout( devLayout );

const stories = require( './stories' ).reduce( ( stories, story ) => {

  // each dev story has its instanciated service app
  return _.set( stories, story.slug, _.assign( story, { service:
    Service( story.config )
  } ) );

}, {} );

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true,
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );


dev.get( '/', ( req, res ) => {

  res.send( devLayout( '<div class="margin-top-lg">' +
    _.chunk( _.keys( stories ), 4 ).map( chunk => '<div class="row">' +
      chunk.map( slug => `
        <div class="col-md-3">
          <div class="wsq padding-all-sm margin-all-sm">
            <label>${stories[ slug ].name}</label>
            <p>${stories[ slug ].description}</p>
            <a href="/${slug}">Open</a>
          </div>
        </div>
      ` ).join( '' ) +
    '</div>' ).join( '' ) + '</div>'
  ) );

} );

// useful only if frontAppPath is given to service at init
dev.use( '/dist',
  Service.router.dist,
  ( req, res, next ) => res.send( 404 ) // if not, unhandled files will be handled by following routes
);

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );
dev.get( '/favicon.ico', ( req, res ) => res.sendStatus( 404 ) );
dev.use( '/fonts', express.static( __dirname + '/../bs-templates/templates/fonts' ) );

dev.use( '/:story', ( req, res, next ) => {

  const story = stories[ req.params.story ];

  if ( !story ) return res.redirect( 302, '/' );

  Service.router.setService( story.service );

  _.assign( req, story.req );

  next();

} );

dev.use( '/:story', Service.router );

dev.listen( 3000 );
