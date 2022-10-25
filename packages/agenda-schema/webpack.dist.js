"use strict";

const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const CompressionPlugin = require( 'compression-webpack-plugin' );
const S3Plugin = require( 'webpack-s3-plugin' );
const WebpackAssetsManifest = require( 'webpack-assets-manifest' );

const serviceName = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/package.json', 'utf-8' )
).name.split( '/' ).pop();

const pushToCDN = process.env.NODE_ENV === 'production' && parseInt( process.env.CDN );

const localDistPath = __dirname + '/client/dist';

module.exports = {
  // better to have a dist file in dev mode for local troubleshooting
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: __dirname,
  // defaults at true
  optimization: { minimize: true },
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './client/src/index.js'
  ],
  output: {
    path: localDistPath,
    filename: '[name]-[contenthash].js',
    chunkFilename: '[id]-[chunkhash].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackAssetsManifest( {
      output: __dirname + '/client/dist/manifest.json'
    } )
  ].concat(
    pushToCDN ? [
      new CompressionPlugin( {
        test: /\.js$/,
        filename ( asset ) {
          return asset.file.replace( '.gz', '' );
        }
      } ), new S3Plugin( {
        include: /\.js$/,
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'eu-west-1'
        },
        s3UploadOptions: {
          Bucket: 'oasvc',
          ContentEncoding: 'gzip'
        },
        basePathTransform: f => [ serviceName, f ].join( '/' )
      } )
  ] : [] ),
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader')
        }
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader')
        ]
      },
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          require.resolve('sass-loader')
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.wasm'],
    symlinks: false,
    alias: {
      // required only for the timings component
      'react': require.resolve( 'react' )
    },
    extensions: ['.js', '.mjs', '.json', '.wasm'],
  },
};
