"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const webpack = require( 'webpack' );

const bodyParser = require( 'body-parser' );

const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );

const filesMw = require( './server/middleware/files' );
const schemaMw = require( './server/middleware/schema' );

const config = require( './testconfig' );

// normally done through init of service
filesMw.init( {
  tmpFolder: __dirname + '/dev/tmp',
  s3: _.pick( config.s3, [ 'accessKeyId', 'secretAccessKey', 'region', 'bucket' ] )
} );

const devScenarios = {
  fileupload: require( './dev/fileupload' ),
  imageupload: require( './dev/imageupload' ),
  simplest: require( './dev/simplest' )
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

    // when resources are loaded or posted for a specific instance,
    // created or yet to be created, the server
    // should know what schema is being created

    const { schema, values, fileKey } = _.get( devScenarios, req.params.page );

    req.schema = schema;
    req.values = values; // these are the current values
    req.fileKey = fileKey;

    next();

  },
  filesMw.putInTemporary.bind( null, { /* use defaults */ } ),
  filesMw.uploadFilesToS3.bind( null, { /* defaults */ } ),
  filesMw.cleanFileValues.bind( null, {} ),
  schemaMw.clean.bind( null, {} ),
  ( req, res, next ) => {

    // this here should include file values
    console.log( 'clean', req.clean );

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
