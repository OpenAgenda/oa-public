"use strict";

const webpack = require( 'webpack' ),

  nodeExternals = require( 'webpack-node-externals' ),

  path = require( 'path' );


module.exports = {
  target: 'node',
  cache: false,
  context: path.resolve( __dirname, '..' ),
  debug: false,
  devtool: 'source-map',
  entry: {
    'test-app': './test/app/index.js'
  },
  output: {
    path: path.resolve( __dirname, '..', 'bin' ),
    filename: 'test-app.js'
  },
  plugins: [
    new webpack.DefinePlugin( { __CLIENT__: false, __SERVER__: true, __PRODUCTION__: true, __DEV__: false } ),
    new webpack.DefinePlugin( { 'process.env': { NODE_ENV: 'production' } } )
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
  externals: [ nodeExternals() ],
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