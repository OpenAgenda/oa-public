'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || 'production';
const devServerPort = process.env.PORTAL_DEV_SERVER_PORT || 3001;

module.exports = {
  mode,
  entry: {
    main: process.env.PORTAL_SASS_PATH,
    dev: [
      'webpack-dev-server/client/index.js?hot=true&live-reload=true',
      'webpack/hot/dev-server.js'
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  devServer: {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          require.resolve('css-loader'),
          require.resolve('sass-loader')
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  ],
  stats: {
    preset: 'minimal',
    colors: true,
    assets: false,
    modules: false,
    errorDetails: true,
    errorStack: true
  }
};
