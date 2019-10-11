"use strict";

const CompressionPlugin = require( 'compression-webpack-plugin' );
const LodashModuleReplacementPlugin = require( 'lodash-webpack-plugin' );
const S3Plugin = require( 'webpack-s3-plugin' );

const serviceName = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/package.json', 'utf-8' )
).name.split( '/' ).pop();

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './client/src/index.js',
  output: {
    filename: 'index.js',
    path: __dirname + '/client/dist'
  },
  plugins: [ new LodashModuleReplacementPlugin ].concat(
    ( process.env.NODE_ENV === 'production' && parseInt( process.env.CDN ) ) ? [
      new CompressionPlugin( {
        test: /\.js/,
        filename ( asset ) {
          return asset.file.replace( '.gz', '' );
        }
      } ), new S3Plugin( {
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'eu-west-1'
        },
        s3UploadOptions: {
          Bucket: 'oasvc',
          ContentEncoding: 'gzip'
        },
        basePathTransform: f => [ serviceName, f ].join( '/' )
      } )
  ] : [] ),
  module: {
    rules: [ {
      test: /\.js$/,
      use: {
        loader: 'babel-loader'
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
};
