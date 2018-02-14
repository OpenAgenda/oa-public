"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

module.exports = _.template( fs.readFileSync( __dirname + '/head.tpl', 'utf-8' ) );