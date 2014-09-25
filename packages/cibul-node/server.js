var supervisor = require( './lib/supervisor' ),

log = require( './lib/logger' )('server');

supervisor(function( loadTasks ) {

  log('running server');

  // load libraries

  var router = require('./lib/router'),

  coms = require('./lib/coms'),

  express = require( 'express' ),

  cookieParser = require( 'cookie-parser' ),

  config = require( './config' ),

  app = express(),

  webModules,

  taskModules;

  app.use( require('cookie-parser')() );


  // all web app modules are defined here and optionally loaded

  webModules = [
    require( './newsletter/back' )( '/:slug/admin/newsletters' ).load( app ),
    require( './newsletter/front' )( '/:slug/newsletters' ).load( app ),
    require( './general/front' )( '' ).load( app ),
    require( './search/front' )( '' ).load( app )
  ];

  app.listen( config.port );

  

  if ( !loadTasks ) return;

  taskModules = [
    require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } ),
    require( './mailer/task' ).load( { bootOffset: 14909 })
  ];

});