"use strict";

const CompressionPlugin = require( 'compression-webpack-plugin' );
const LodashModuleReplacementPlugin = require( 'lodash-webpack-plugin' );
const S3Plugin = require( 'webpack-s3-plugin' );

module.exports = {
  mode: 'production',
  context: __dirname,
  /* defaults at true optimization: {
    minimize: false
  },*/
  entry: [
    // 'babel-polyfill', // for async await ( cannot be used twice https://github.com/babel/babel-loader/issues/401 )
    './client/src/index.js'
  ],
  output: {
    filename: 'app.js',
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
        basePathTransform: f => 'agenda-calendar-apps/' + f
      } )
  ] : [] ),
  module: {
    rules: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    } ]
  },
  resolve: {
    symlinks: false
  }
};
