'use strict';

const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { mkdirp } = require('mkdirp');
const webpack = require('webpack');
const ProgressBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const WebpackDashboardPlugin = require('webpack-dashboard/plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const modulesToInclude = [
  '@feathersjs',
  '@openagenda',
  '@react-leaflet/core',
  '@uppy',
  'buffer',
  'debug',
  'intl-messageformat',
  'intl-messageformat-parser',
  'is-plain-obj',
  'ky',
  'lru-cache',
  'react-intl',
  'react-leaflet',
  'react-markdown',
  'yallist',
];
const BABEL_EXCLUDE_REGEX = new RegExp(
  `node_modules/(?!(${modulesToInclude.join('|')}))`,
);

const bucket = process.env.S3_ASSETS_BUCKET;
const serviceName = require('./package.json').name.split('/').pop();

const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
const devServerPort = parseInt(process.env.DEV_SERVER_PORT, 10) || 8905;

function getCacheDir(name) {
  const homeCacheDir = path.join(os.homedir(), '.cache');
  const persistentPath = path.join(homeCacheDir, serviceName, name);

  if (fs.existsSync(homeCacheDir)) {
    mkdirp.sync(persistentPath);

    return persistentPath;
  }

  return `node_modules/.cache/${name}`;
}

module.exports = (env = {}, argv = {}) => {
  const defaultEnvName = env.production || argv.mode === 'production' ? 'production' : 'development';
  const envName = process.env.NODE_ENV || env.NODE_ENV || defaultEnvName;
  const babelEnvName = process.env.BABEL_ENV || env.BABEL_ENV || envName;

  const pushToCDN = envName === 'production' && parseInt(process.env.CDN || env.CDN, 10);

  return {
    mode: envName === 'production' ? 'production' : 'development',
    entry: {
      webapp: path.join(__dirname, 'client/index.js'),
      outdated: '@openagenda/outdated-browser',
      vendors: ['react', 'react-dom'].concat(
        envName === 'development' && argv.hot ? ['react-refresh/runtime'] : [],
      ),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: pushToCDN
        ? `https://cdn.openagenda.com/assets/svc/${serviceName}/`
        : `/dist/${serviceName}/`,
      filename: '[name].[contenthash].js',
    },
    devtool:
      envName === 'production' ? 'source-map' : 'cheap-module-source-map',
    devServer: {
      host: devServerHost,
      port: devServerPort,
      https: {
        key: process.env.DEV_SSL_KEY
          ? fs.readFileSync(path.resolve(__dirname, process.env.DEV_SSL_KEY))
          : undefined,
        cert: process.env.DEV_SSL_CERT
          ? fs.readFileSync(path.resolve(__dirname, process.env.DEV_SSL_CERT))
          : undefined,
        ca: process.env.DEV_SSL_CA
          ? fs.readFileSync(path.resolve(__dirname, process.env.DEV_SSL_CA))
          : undefined,
      },
      static: path.resolve(__dirname, 'dist'),
      allowedHosts: ['.openagenda.com'],
      headers: { 'Access-Control-Allow-Origin': '*' },
      compress: true,
      hot: argv.hot ?? true,
      liveReload: false,
      devMiddleware: {
        publicPath: `/dist/${serviceName}/`,
        writeToDisk: (filePath) => /loadable-stats\.json$/.test(filePath),
      },
    },
    stats: {
      preset: 'minimal',
      colors: true,
      assets: false,
      modules: false,
      errorDetails: true,
      errorStack: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          loader: require.resolve('source-map-loader'),
          resolve: {
            fullySpecified: false,
          },
          exclude: [
            /\/node_modules\/rrule\//, // https://github.com/jakubroztocil/rrule/issues/303
            /\/node_modules\/@transloadit\/prettier-bytes\//,
            /\/node_modules\/nth-check\//,
            /\/node_modules\/@formatjs\//,
            /\/node_modules\/intl-messageformat\//,
          ],
        },
        {
          test: /\.(js|mjs|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: [
            BABEL_EXCLUDE_REGEX,
            /\/node_modules\/@openagenda\/leaflet-gesture-handling\//,
          ],
          options: {
            cacheDirectory: process.env.DISABLE_WEBPACK_CACHE
              ? false
              : getCacheDir('babel-loader-dev'),
            envName: babelEnvName,
            rootMode: 'upward',
            caller: {
              supportsHotReload: argv.hot,
            },
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            envName !== 'production'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // only enable hot in development
                hmr: envName === 'development' && argv.hot,
                // if hmr does not work, this is a forceful method.
                // reloadAll: true,
              },
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      // symlinks: false,
      extensions: ['.wasm', '.mjs', '.cjs', '.js', '.jsx', '.json'],
      fallback: {
        buffer: require.resolve('buffer'),
      },
      conditionNames: ['oa', '...'],
    },
    performance: {
      hints: false,
      maxAssetSize: envName === 'production' ? 2000000 : Infinity,
    },
    cache: {
      type: process.env.DISABLE_WEBPACK_CACHE ? 'memory' : 'filesystem',
    },
    optimization: {
      nodeEnv: envName,
      moduleIds: envName === 'production' ? 'deterministic' : 'named',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxAsyncRequests: 20,
        // minSize: 0,
        // cacheGroups: {
        //   locale: {
        //     test: module => (module.type === 'json' && module.resource && module.resource.includes('/locales/')),
        //     name(module, chunks, cacheGroupKey) {
        //       const moduleFileName = module.identifier().split('/').reduceRight(item => item);
        //       const lang = moduleFileName.split('.').slice(0, -1).join('.');
        //
        //       return `${cacheGroupKey}-${lang}`;
        //     },
        //     chunks: chunk => chunk.name.startsWith('locale-'), // chunk => chunk.name.startsWith('locale-'),
        //     enforce: true,
        //     reuseExistingChunk: false
        //   }
        // }
      },
      minimize: envName === 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: { sourceMap: true },
        }),
        new CssMinimizerPlugin(),
      ],
    },
    plugins: [
      // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
      process.env.ANALYZE === '1' ? new WebpackDashboardPlugin() : null,
      new ProgressBar({ basic: false }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({ NODE_ENV: envName }),
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new LoadablePlugin(),
      new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
      new CleanWebpackPlugin(),
    ]
      .concat(
        envName === 'development' && argv.hot
          ? [new ReactRefreshWebpackPlugin()]
          : [],
      )
      .concat(
        pushToCDN
          ? [
            // new CompressionPlugin( {
            //   test: /\.(js|css)$/,
            //   filename: 'gz/[path][query]'
            // } ),
            new S3Plugin({
              s3Options: {
                endpoint: process.env.S3_ENDPOINT,
                region: process.env.S3_REGION,
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                s3ForcePathStyle: true,
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
                },
              },
              progress: false,
              basePath: `svc/${serviceName}`,
              // directory: 'dist/gz'
            }),
          ]
          : [],
      )
      .filter(Boolean),
  };
};
