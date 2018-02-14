"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

const render = {
  txt: _.template( fs.readFileSync( __dirname + '/txtHead.tpl', 'utf-8' ) ),
  md: _.template( fs.readFileSync( __dirname + '/mdHead.tpl', 'utf-8' ) )
}

module.exports = ( format, data ) => render[ format ]( data );