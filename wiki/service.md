Preparing a new service for OpenAgenda

# Overview

The following procedure describes how to initialize a functional service that can be integrated in OpenAgenda

## Initialize project

If in lerna, create the folder, cd in the folder and `yarn init --yes`.

Edit the package.json file and adapt the license

## Create folders

Create the following folders:

 * **test**: for test files
 * **client**: for front scripts
 * **server**: for server scripts
 * **iso**: optionnaly for any scripts that will be used in both client and server. **Iso files require no transpiling to be required inside server scripts**
 * **client/src**: for client source files
 * **client/dist**: for client bundled files

If the service is server-based or client-based only, server or client folders can be omitted and their content put at the root of the project folder.


## Initialize a development server

First get a development server running with hot reload when changes are brought to the code. The file should be named `server.dev.js` and should be at the root of the project.

Add the following libs to your project:

 * nodemon: ( dev ) for reloading server files on file change
 * express: light http framework. In dev deps if the service will not have a backend, in normal deps otherwise

Add the following file at the root of the project to tell to nodemon which files to look at: `nodemon.json`. Should contain the following:

    {
      "verbose": true,
      "ignore": [ "client/*" ]
    }

Put the following lines in the `server.dev.js` files:

    "use strict";

    const express = require( 'express' );

    const dev = express();

    dev.get( '/', ( req, res ) => {

      res.send( '<html><head></head><body><p>hello</p></body></html>' );

    } );

    dev.listen( 3000 );

Add add a start script to package.json:

    "scripts" : {
      "start": "nodemon server.dev"
    }

Do a little yarn start, then change the content of the file. Refresh and see the change. All is good up to now.


## Initialize the front development environment

With hot reload.

More packages are needed ( in dev deps ):

 * *babel dependencies*: babel-core babel-loader babel-plugin-lodash babel-plugin-transform-es3-member-expression-literals babel-plugin-transform-es3-property-literals babel-plugin-transform-object-rest-spread babel-preset-env babel-preset-es2015 babel-preset-minify babel-preset-react babel-preset-stage-0
 * *webpack dependencies*: webpack webpack-cli webpack-dev-middleware webpack-hot-middleware lodash-webpack-plugin

The webpack dev configuration should be placed in the root of the project in a file named `webpack.dev.js`. Here is the content:

    "use strict";

    const webpack = require( 'webpack' );

    module.exports = {
      mode: 'development',
      context: __dirname,
      entry: [
        'webpack-hot-middleware/client',
        './client/src/index.js'
      ],
      output: {
        filename: 'app.js'
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
      ],
      module: {
        rules: [ {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                'babel-preset-env',
                'babel-preset-react',
                'babel-preset-es2015',
                'babel-preset-stage-0'
              ]
            }
          }
        } ]
      },
      resolve: {
        symlinks: false
      }
    };

Create a file with the following content in client/src/index.js:

    "use strict";

    if ( module.hot ) module.hot.accept();

    alert( 'bam' );

In `server.dev.js`:

Add webpack and the webpack config file references:

    const webpack = require( 'webpack' );

    const webpackConfig = require( './webpack.dev' );
    const compiler = webpack( webpackConfig );

Set the dev app to use the webpack development middleware, and the hot reload module:

    dev.use( require( 'webpack-dev-middleware' )( compiler, {
      noInfo: true,
      publicPath: '/js'
    } ) );

    dev.use( require( 'webpack-hot-middleware' )( compiler ) );

Adapt the content of the string that is sent to set a reference to the dev js file:

    res.send( '<!DOCTYPE html><html><body><p>hello</p><script src="js/app.js"></script></body></html>');

`yarn start` and see the js file be executed and updated as you bring changes to it


## Bootstrap a react app

Add react dependencies to the package.json: react, react-dom, prop-types.

In your front index.js file, add react imports:

    import PropTypes from 'prop-types';
    import React, { Component } from 'react';
    import { render } from 'react-dom';

Put a component:

    class Main extends Component {

      render() {

        return <div>
          <p>The main component</p>
        </div>

      }

    }

Render it:

    render( <Main />, document.getElementById( 'app' ) );

Adapt the page rendered by the dev server to add a canvas for the app:

    res.send( '<!DOCTYPE html><html><body><div id="app"></div><script src="js/app.js"></script></body></html>');


## Styling

Supposing the style is the responsibility of another repo, the sheet can be delivered by the dev server without any need of additional packages ( at the exception of the repo where the styling is located )

    yarn add --dev @openagenda/bs-templates

And in the server file:

First require the compiled css:

    const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

Then serve it:

    dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

Add a reference in the html string:

    res.send( '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><div id="app"></div><script src="js/app.js"></script></body></html>');

Otherwise, you'll need the following packages as dev dependencies

    "css-loader": "^0.28.7",
    "node-sass": "^4.7.2",
    "sass-loader": "^6.0.6",
    "style-loader": "^0.19.0",

And additional rules in the webpack file:

    [ /* the js rule here */ {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    } ]

# Server: setting up a backend service

If the repo should host a backend service, that service could provide an express app to which all calls from the client could be forwarded to.

That app is responsible for generating the canvas that will host the client application and provide it with all necessary configuration.

Create an index.js file in the server folder with the following content:

    "use strict";

    const express = require( 'express' );

    const app = express();

    module.exports = {
      app
    }

    app.get( '/', ( req, res ) => {

      res.send( '<!DOCTYPE html><html><head><link rel="stylesheet" href="/style.css"></head><body><div id="app"></div><script src="js/app.js"></script></body></html>' );

    } );

And in the server.dev.js file, we redirect root calls to /app:

    dev.get( '/', ( req, res ) => res.redirect( 302, '/app' ) );

The server index can be used as the repo endpoint in the package.json file:

    "main" : "server/index.js"

And use the server service app for everything coming to the /app route:

    const service = require( './' );

    dev.use( '/app', service.app );

If you yarn start at this point, you'll see the redirection take place and the service app provide the page content.

Most of the time, the integrating application, simulated here with server.dev.js will be responsible for providing a layout to the global page, including things like general styling references and a website header. This can be achieved by providing the service with a layout function which will be given the service rendered page and return the page rapped up with a layout.

The layout function can be simulated in server.dev.js as follows:

    const layoutStr = `<!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body><!--content--></body>
    </html>`;

    function layout( req, content ) {

      return layoutStr.replace( '<!--content-->', content );

    }

The function can be provided to the service through an initialisation function:

    service.init( {
      layout
    } );

In server/index.js, the init function must be created and exported ( add lodash as a dependency while you are at it ). server.dev.js should look like this:

    "use strict";

    const _ = require( 'lodash' );

    const express = require( 'express' );

    const app = express();

    module.exports = {
      app,
      init: c => _.extend( config, c )
    }

    const config = {
      layout: content => content
    }

    app.get( '/', ( req, res ) => {

      res.send( config.layout( req, '<div id="app"></div><script src="/js/app.js"></script>' ) );

    } );


The integrating app is now responsible for providing a layout, the integrated app can use that layout to generate a canvas and send it back to the browser, with any front scripts it is also responsible for providing.


## Client: distributing assets

A dist script is used to build scripts ready to be loaded on a static page to load a feature. The dist script launches a webpack build which should do the following:

 1. Transpile client js and compile an enpoint app file set in a distinct local path: client/dist/app.js

 2. Zip it

 3. Push it to a bucket on s3.

Webpack works with plugin extensions which specifically handle this:

 * **compression-webpack-plugin**: gzips assets
 * **webpack-s3-plugin**: pushes assets to s3.

A new environment variable is used to avoid pushing new assets to s3 by accident: CI

For pushing things to S3, set your keys in env variables to make them accessible through the process.env:

    process.env.AWS_ACCESS_KEY_ID
    process.env.AWS_SECRET_ACCESS_KEY;

The dist script in package.json should be created:

    "dist": "webpack --config webpack.dist.js"

And should contain the following for transpiling, compiling, compressing and pushing to s3:

    "use strict";

    const CompressionPlugin = require( 'compression-webpack-plugin' );
    const LodashModuleReplacementPlugin = require( 'lodash-webpack-plugin' );
    const S3Plugin = require( 'webpack-s3-plugin' );

    module.exports = {
      mode: 'production',
      context: __dirname,
      /* defaults at true optimization: {
        minimize: false
      },*/
      entry: [
        'babel-polyfill', // for async await ( cannot be used twice https://github.com/babel/babel-loader/issues/401 )
        './client/src/index.js'
      ],
      output: {
        filename: 'app.js',
        path: __dirname + '/client/dist'
      },
      plugins: [ new LodashModuleReplacementPlugin ].concat(
        ( process.env.NODE_ENV === 'production' && parseInt( process.env.CDN ) ) ? [
          new CompressionPlugin( {
            test: /\.js/,
            filename ( asset ) {
              return asset.replace( '.gz', '' );
            }
          } ), new S3Plugin( {
            s3Options: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              region: 'eu-west-1'
            },
            s3UploadOptions: {
              Bucket: 'oasvc',
              ContentEncoding: 'gzip'
            },
            basePathTransform: f => 'agenda-calendar-apps/' + f
          } )
      ] : [] ),
      module: {
        rules: [ {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                'lodash'
              ],
              presets: [
                'babel-preset-env',
                'babel-preset-react',
                'babel-preset-es2015',
                'babel-preset-stage-0'
              ]
            }
          }
        }, {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        }, {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        } ]
      },
      resolve: {
        symlinks: false
      }
    };
