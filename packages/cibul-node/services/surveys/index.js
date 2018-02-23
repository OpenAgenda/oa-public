"use strict";

const fs = require( 'fs' );

const surveys = require( '@openagenda/surveys/server' );

module.exports.init = config => {

 surveys.init( {
   // this bit can be linked for the time being
   frontAppPath: '/js/surveys.js',
   knex: config.knex,
   schema: 'survey',
   decorateKey: 'decorate',
   layout: fs.readFileSync( __dirname + '/canvas.tpl', 'utf-8' )
 } ) 

}