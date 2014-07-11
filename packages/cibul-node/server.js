var run = function() {

  debug.enable(config.logLevel);

  loadApp('newsletter', '/:slug/admin/newsletter');

  app.listen(config.port);

},

express = require('express'),

app = express(),

config = require('./config'),

debug = require('debug');

loadApp = function(name, route) {

  app.use(require('./' + name + '/app')(route, config));

};

run();