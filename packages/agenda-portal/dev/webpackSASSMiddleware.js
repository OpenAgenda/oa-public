'use strict';

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = sassFilePath => {
  const compiler = webpack({
    mode: 'none',
    entry: sassFilePath, // in agenda-portal, this is boot, in deployed, this is sass
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      })
    ]
  });

  return webpackDevMiddleware(compiler, {
    publicPath: '/'
  });
};
