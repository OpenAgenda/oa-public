"use strict";

const fs = require( 'fs' );

const surveys = require( '@openagenda/surveys/server' );

module.exports.init = config => {

 surveys.init( {
   knex: config.knex,
   schema: 'survey',
   decorateKey: 'decorate',
   layout: fs.readFileSync( __dirname + '/canvas.tpl', 'utf-8' )
 } ) 

}