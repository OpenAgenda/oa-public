import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import browsersListConfig from '@openagenda/browserslist-config';

const mode = process.env.NODE_ENV || 'production';
const devServerPort = process.env.PORTAL_DEV_SERVER_PORT || 3001;

export default {
  mode,
  context: process.env.PORTAL_DIR,
  entry: [
    path.join(process.env.PORTAL_DIR, process.env.PORTAL_SASS_PATH),
    path.join(process.env.PORTAL_DIR, process.env.PORTAL_JS_PATH),
  ],
  output: {
    path: path.join(
      process.env.PORTAL_DIR,
      process.env.PORTAL_ASSETS_FOLDER,
      'dist',
    ),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/dist/',
  },
  target: `browserslist:${browsersListConfig}`,
  devServer: {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: fileURLToPath(import.meta.resolve('babel-loader')),
        options: {
          presets: ['@openagenda'],
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          fileURLToPath(import.meta.resolve('css-loader')),
          {
            loader: fileURLToPath(import.meta.resolve('resolve-url-loader')),
            options: {
              root: path.join(
                process.env.PORTAL_DIR,
                process.env.PORTAL_ASSETS_FOLDER,
              ),
            },
          },
          {
            loader: fileURLToPath(import.meta.resolve('sass-loader')),
            options: {
              implementation: sass,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(otf|ttf|ttc|eot|woff|woff2)$/,
        loader: fileURLToPath(import.meta.resolve('file-loader')),
        options: {
          name: '[name].[contenthash:8].[ext]',
          outputPath: 'fonts/',
          esModule: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        loader: fileURLToPath(import.meta.resolve('file-loader')),
        options: {
          name: '[name].[contenthash:8].[ext]',
          outputPath: 'images/',
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  stats: {
    preset: 'minimal',
    colors: true,
    assets: false,
    modules: false,
    errorDetails: true,
    errorStack: true,
  },
};
