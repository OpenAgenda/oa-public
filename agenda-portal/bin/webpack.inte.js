'use strict';

const path = require('path');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const browsersListConfig = require('@openagenda/browserslist-config');

const mode = process.env.NODE_ENV || 'production';
const devServerPort = process.env.PORTAL_DEV_SERVER_PORT || 3001;

module.exports = {
  mode,
  context: process.env.PORTAL_DIR,
  entry: [
    path.join(process.env.PORTAL_DIR, process.env.PORTAL_SASS_PATH),
    path.join(process.env.PORTAL_DIR, process.env.PORTAL_JS_PATH),
  ],
  output: {
    path: path.join(process.env.PORTAL_DIR, process.env.PORTAL_ASSETS_FOLDER, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/dist'
  },
  target: `browserslist:${browsersListConfig}`,
  devServer: {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: new RegExp('node_modules'),
        loader: require.resolve('babel-loader'),
        options: {
          presets: ['@openagenda']
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          require.resolve('css-loader'),
          {
            loader: require.resolve('sass-loader'),
            options: {
              implementation: sass
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin()
    ],
  },
  stats: {
    preset: 'minimal',
    colors: true,
    assets: false,
    modules: false,
    errorDetails: true,
    errorStack: true
  }
};
