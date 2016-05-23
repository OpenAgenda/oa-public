"use strict";

const webpack = require( 'webpack' ),

  path = require( 'path' );


module.exports = {
  target: 'web',
  cache: false,
  context: path.resolve( __dirname, '..' ),
  debug: false,
  devtool: false,
  entry: {
    'client': './react/index.js'
  },
  output: {
    path: path.resolve( __dirname, '../bin' ),
    filename: 'react.js'
  },
  plugins: [
    new webpack.DefinePlugin( { __CLIENT__: true, __SERVER__: false, __PRODUCTION__: true, __DEV__: false } ),
    new webpack.DefinePlugin( { 'process.env': { NODE_ENV: 'production' } } ),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin( { compress: { warnings: false } } )
  ],
  module: {
    loaders: [
      { test: /\.json$/, loaders: [ 'json' ] },
      {
        test: /\.(ico|gif|png|jpg|jpeg|svg|webp.sql)$/,
        loaders: [ 'file?context=static&name=/[path][name].[ext]' ],
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        query: {
          presets: [
            'babel-preset-es2015',
            'babel-preset-react',
            'babel-preset-stage-0',
          ].map( require.resolve )
        },
        exclude: /node_modules/
      }
    ],
    noParse: /\.min\.js/
  },
  progress: true,
  resolve: {
    modulesDirectories: [ 'node_modules' ],
    extensions: [ '', '.json', '.js', '.jsx' ]
  },
  resolveLoader: { root: path.join( __dirname, "../node_modules" ) },
  node: {
    __dirname: true,
    __filename: true,
    fs: 'empty'
  }
};