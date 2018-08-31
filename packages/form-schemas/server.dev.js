"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const webpack = require( 'webpack' );

const bodyParser = require( 'body-parser' );

const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );

const filesMw = require( './server/middleware/files' );

const config = require( './config.dev' );

// normally done through init of service
filesMw.init( {
  tmpFolder: __dirname + '/dev/tmp',
  s3: _.pick( config.s3, [ 'accessKeyId', 'secretAccessKey', 'region', 'bucket' ] )
} );

const devSchemas = {
  fileupload: require( './dev/fileupload' )
}

const dev = express();

// the service cou


const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.get( '/', ( req, res ) => res.send( render( 'index' ) ) )

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.use( '/fonts', express.static( __dirname + '/../bs-templates/templates/fonts' ) );

dev.get( '/:page', ( req, res ) => res.send( render( req.params.page ) ) );

dev.post( '/:page', 
  bodyParser.json(),
  ( req, res, next ) => {

    // this is useful for preparing the processing of files.
    // when the schema contains file types ( images or files )
    // those need to be processed when set by a specific middleware
    // that places them in a temporary folder for further processing

    req.schema = _.get( devSchemas, req.params.page );
    req.fileKey = 'uniquefilekey123';

    next();

  },
  filesMw.putInTemporary.bind( null, { /* use defaults */ } ),
  filesMw.s3Upload,
  filesMw.updateBodyValues,
  ( req, res, next ) => {

    // this here should include file values
    console.log( req.body );

    next();

  },
  ( req, res ) => {

    res.json( {
      message: 'ok, ' + req.params.page
    } );

  } 
);

dev.listen( 3000 );

function render( filename ) {

  return `<!DOCTYPE html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <html>
      <body>
        <div id="app"></div>
        <script src="js/${filename}.js"></script>
      </body>
    </html>`;

}
