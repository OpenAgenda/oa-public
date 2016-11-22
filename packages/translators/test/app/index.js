"use strict";

const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [ __dirname + '/style.scss' ],
  decorateCanvas: false
} );


app.get( '/', ( req, res, next ) => {

  req.content = '';

  next();

} );


app.getAndListen();