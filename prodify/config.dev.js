"use strict";

const path = require( 'path' ),

  webpack = require( 'webpack' ),

  ourOwnModules = require( './ourOwnModules.json' );


module.exports = ( paths ) => {

  return {
    devtool: 'cheap-module-eval-source-map',
    entry: path.join( __dirname, paths.src.path, paths.src.name ),
    output: {
      path: paths.dest.path,
      filename: paths.dest.name
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel',
          exclude: new RegExp( 'node_modules\\/(?!' + ourOwnModules.join( '|' ) + ')' )
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.ejs$/,
          loader: 'ejs-compiled'
        },
        {
          test: /\.(css|html|tblr)$/,
          loader: 'raw'
        }
      ]
    },
    progress: true,
    resolve: {
      extensions: [ '', '.js', '.jsx' ],
      moduleDirectories: [ './node_modules' ],
      fallback: path.join( process.cwd(), 'node_modules' ),
      alias: {
        react: path.join( process.cwd(), 'node_modules/react' ),
      }
    },
    resolveLoader: {
      root: path.join( process.cwd(), 'node_modules' ),
      fallback: path.join( process.cwd(), 'node_modules' )
    },
    plugins: [
      new webpack.DefinePlugin( {
        'process.env': {
          NODE_ENV: '"development"'
        },
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: true,
        __DEVTOOLS__: true
      } ),
      new webpack.IgnorePlugin( /(.*)/, /node_modules\/(get-size)/ )
    ],
    node: {
      fs: 'empty'
    }
  };

};