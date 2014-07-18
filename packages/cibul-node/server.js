var run = function() {

  debug.enable(config.logLevel);

  app.use(cookieParser());

  loadApp('newsletter', '/:slug/admin/newsletter');

  app.listen(config.port);

},

express = require('express'),

app = express(),

config = require('./config'),

cookieParser = require('cookie-parser'),

debug = require('debug');

loadApp = function(name, route) {

  app.use(require('./' + name + '/app')(route, config));

};

run();