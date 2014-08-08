var debug = require('debug'),

log = debug('newsletter task'),

mailer = require('./mailer');

module.exports = function( config ) {

  return runnable( config );

};

var runnable = function( config ) {

  log('loading task environment');

  var run = function() {

    log('running');

  };

  return run;

};