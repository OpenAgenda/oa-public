"use strict";

const path = require( 'path' );
const webpack = require( 'webpack' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const ProgressBar = require( 'webpackbar' );
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const LoadablePlugin = require( '@loadable/webpack-plugin' );
const getBabelRule = require( './getBabelRule' );
const getBabelModuleRules = require( './getBabelModuleRules' );


module.exports = ( { entry, output } ) => ({
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    ...entry,
    // webapp: path.join( path.dirname( __dirname ), 'webapp/index.js' )
  },
  output: {
    ...output,
    publicPath: '/js/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        loader: 'source-map-loader'
      },
      getBabelRule(path.join(__dirname, '..')),
      ...getBabelModuleRules([
        '@openagenda/agenda-settings',
        '@openagenda/home',
        '@openagenda/user-apps'
      ]),
      {
        test: /\.ejs$/,
        loader: 'ejs-compiled-loader-webpack4'
      },
      {
        test: /\.(css|html|tblr)$/,
        loader: 'raw-loader'
      }
    ]
  },
  resolve: {
    // symlinks: false,
    extensions: ['.js', '.jsx', '.json']
  },
  performance: {
    hints: false,
    maxAssetSize: Infinity
  },
  plugins: [
    new ManifestPlugin(),
    new ProgressBar({ minimal: false }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*.chunk.js']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true
    }),
    new LoadablePlugin(),
    new webpack.NamedModulesPlugin()
  ],
  node: {
    fs: 'empty'
  }
});
