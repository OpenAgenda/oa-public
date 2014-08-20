var run = function() {

  debug.enable(config.logLevel);

  router = require('./router');

  app.use(cookieParser());

  router.loadGlobalRoutes( config.routes );

  coms = require('./coms')( config );


  // load module apps

  loadApp( 'newsletter/back', '/:slug/admin/newsletters' );

  loadApp( 'newsletter/front', '/:slug/newsletters' );

  loadApp( 'general/front' );

  loadApp( 'search/front' );


  app.listen( config.port );

  loadTask( 'newsletter/task', 60000, 15 );

  loadTask( 'mailer/task' );

},


express = require('express'),

app = express(),

config = require('./config'),

debug = require('debug'),

router,

coms,

cookieParser = require('cookie-parser'),


loadApp = function(name, route) {

  if ( !route ) route = '';

  app.use(require('./' + name)( route, config ));

},


loadTask = function( name, period, initTimeout ) {

  if ( initTimeout === undefined ) initTimeout = 0;

  if ( period === undefined ) period = false;

  var task = require('./' + name)( config, coms );

  setTimeout( function() {

    task();

    if ( period !== false ) setInterval(task, period * 1000);

  }, initTimeout * 1000);

};

run();