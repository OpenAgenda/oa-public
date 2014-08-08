var run = function() {

  debug.enable(config.logLevel);

  router = require('./router');

  app.use(cookieParser());

  router.loadGlobalRoutes(config.routes);

  loadApp( 'newsletter/back', '/:slug/admin/newsletters' );
  loadApp( 'newsletter/front', '/:slug/newsletters' );

  app.listen(config.port);

  loadTask( 'newsletter/task', 60000, 15 );

},

express = require('express'),

app = express(),

config = require('./config'),

debug = require('debug'),

router,

cookieParser = require('cookie-parser'),

loadApp = function(name, route) {

  app.use(require('./' + name)( route, config ));

},

loadTask = function( name, period, initTimeout ) {

  var task = require('./' + name)( config );

  setTimeout( function() {

    task();

    setInterval(task, period * 1000);

  }, initTimeout * 1000);

};

run();