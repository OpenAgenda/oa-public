var run = function() {

  debug.enable(config.logLevel);

  router = require('./router');

  app.use(cookieParser());

  router.loadGlobalRoutes(config.routes);

  loadApp('newsletter', '/:slug/admin/newsletter');

  app.listen(config.port);

},

express = require('express'),

app = express(),

config = require('./config'),

debug = require('debug'),

router,

cookieParser = require('cookie-parser'),

loadApp = function(name, route) {

  app.use(require('./' + name + '/app')(route, config));

};

run();