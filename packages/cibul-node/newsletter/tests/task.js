process.env.NODE_ENV = 'testing';

var config = require('../../config'),

debug = require('debug'),

async = require('async'),

bogusComs = {

  queue: function( queueName, values, cb ) {

    log('queueing on %s values %s', queueName, JSON.stringify( values ));

    cb();

  }

};

debug.enable('*');

var log = debug('newsletter-task-tests'),

cibulModel = require('cibulModel/lib/cibulModel'),

model = cibulModel( config.db );

log( 'running newsletter task tests' );

async.series([

  function( cb ) {

    // get first campaign in db and adjust scheduledAt to now
    
    model.campaigns().list(function( err, campaigns ) {

      if ( err ) return cb( err );

      var now = new Date();

      log( 'adjusting scheduledAt of first campaign to %s', now );

      model.campaigns().instance( campaigns[0] ).setScheduledAt( now, true, function( err ) {

        log( 'adjusted scheduledAt of first campaign in db' );

        if ( err ) return cb( err );

        cb();

      });

    });

  },

  function( cb ) {

    var task = require('../task')( config, bogusComs );

    task();

    cb();

  }

], function() {

  log('done.');

});