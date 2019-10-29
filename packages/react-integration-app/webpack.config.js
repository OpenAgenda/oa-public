"use strict";

const os = require('os');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const webpack = require('webpack');
const ProgressBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');

const modulesToInclude = [
  '@feathersjs',
  '@openagenda\\/activity-apps',
  '@openagenda\\/agenda-settings',
  '@openagenda\\/aggregator-sources',
  '@openagenda\\/home',
  '@openagenda\\/user-apps',
  'react-intl',
  'intl-messageformat',
  'intl-messageformat-parser'
];
const BABEL_EXCLUDE_REGEX = new RegExp(`node_modules\\/(?!(${modulesToInclude.join('|')}))`);

const region = 'eu-west-1';
const bucket = 'oasvc';
const serviceName = require('./package.json').name.split('/').pop();
const CLOUDFRONT_DISTRIBUTION_ID = 'E3NUCLR660OPQ4';

module.exports = (env = {}, argv = {}) => {
  const defaultEnvName = env.production || argv.mode === 'production' ? 'production' : 'development';
  const envName = process.env.NODE_ENV || env.NODE_ENV || defaultEnvName;
  const babelEnvName = process.env.BABEL_ENV || env.BABEL_ENV || envName;

  const pushToCDN = envName === 'production' && parseInt(process.env.CDN || env.CDN, 10);

  return {
    mode: envName === 'production' ? 'production' : 'development',
    devtool: envName === 'production' ? 'source-map' : 'cheap-module-source-map',
    entry: {
      webapp: path.join(__dirname, 'client/index.js')
    },
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: pushToCDN
        ? '//d1771xfuxsyp4n.cloudfront.net/'// `https://s3.${region}.amazonaws.com/${bucket}/${serviceName}/`
        : `/dist/${serviceName}/`,
      filename: '[id].[chunkhash].js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          enforce: 'pre',
          loader: 'source-map-loader'
        },
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: BABEL_EXCLUDE_REGEX,
          options: {
            cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-dev' ),
            envName: babelEnvName,
            rootMode: 'upward'
          }
        },
        {
          test: /\.ejs$/,
          loader: 'ejs-compiled-loader-webpack4',
        },
        {
          test: /\.(css|html|tblr)$/,
          loader: 'raw-loader',
        }
      ]
    },
    resolve: {
      // symlinks: false,
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom')
      }
    },
    performance: {
      hints: false,
      maxAssetSize: envName === 'production' ? 2000000 : Infinity
    },
    optimization: {
      nodeEnv: envName,
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
      },
      moduleIds: 'hashed',
      minimize: envName === 'production',
      minimizer: [
        new TerserPlugin({
          cache: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir('terser-webpack-plugin'),
          // parallel: true
          sourceMap: true,
        })
      ]
    },
    plugins: [
      // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
      new (require('webpack-dashboard/plugin'))(),
      new ProgressBar({ minimal: false }),
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': `"${envName}"`,
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: envName === 'development',
        __DEVTOOLS__: envName === 'development'
      }),
      new LoadablePlugin(),
      envName === 'production' ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin()
    ].concat(
      pushToCDN ? [
        // new CompressionPlugin( {
        //   test: /\.(js|css)$/,
        //   filename: 'gz/[path][query]'
        // } ),
        new S3Plugin({
          s3Options: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region
          },
          s3UploadOptions: {
            Bucket: bucket,
            // ContentEncoding( fileName ) {
            //   if ( /^gz\//.test( fileName ) ) {
            //     return 'gzip';
            //   }
            // },
            ContentType(fileName) {
              if (/\.css$/.test(fileName)) {
                return 'text/css';
              }
              if (/\.js$/.test(fileName)) {
                return 'text/javascript';
              }
            }
          },
          cloudfrontInvalidateOptions: {
            DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
            Items: ['/*']
          },
          progress: false,
          basePath: serviceName,
          // directory: 'dist/gz'
        })
      ] : []),
    node: {
      fs: 'empty'
    }
  };
};

function getCacheDir(name) {
  const homeCacheDir = path.join(os.homedir(), '.cache');
  const persistentPath = path.join(homeCacheDir, 'react-integration-app', name);

  if (fs.existsSync(homeCacheDir)) {
    mkdirp.sync(persistentPath);

    return persistentPath;
  }

  return `node_modules/.cache/${name}`;
}
