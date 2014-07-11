/**
 * route handlings
 */

module.exports = function(base, config) {

  var get = defineGet(base),

  model = cibulModel(config.db),

  mw = middlewares(model);

  app.param('slug', mw.loadAgenda);

  get(function(req, res) {

    res.send('grut');

  });

  return app;

};


/**
 * load dependencies
 */

var debug = require('debug'),

log = debug('newsletter'),

express = require('express'),

app = express(),

cibulModel = require('cibulModel/lib/cibulModel'),


/**
 * middleware functions
 */

middlewares = function(model) {

  return {

    loadAgenda: function(req, res, next, slug) {

      model.reviews().get({slug: req.params.slug}, function(err, data) {

        if (err) return errorResponse(req, res, err);

        if (data===null) return unkownResponse(req, res, slug);

        req.agenda = data;

        next();

      });

    }
  }

},


/**
 * utils and common handlings
 */

errorResponse = function(req, res, message) {

  res.send('error: ' + message);

},

unkownResponse = function(req, res, value) {

  res.send('unknown: ' + value);

},

defineGet = function(base) {

  return function(relPath, cb) {

    if (typeof relPath == 'function') {

      cb = relPath;

      relPath = '';

    }

    app.get(base + relPath, cb);

  };

};