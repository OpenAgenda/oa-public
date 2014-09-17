/**
 * test mailer task
 *
 * ideally bounces and such should be handled by a task via sns
 */

process.env.NODE_ENV = 'testing';

var debug = require('debug'),

should = require('should'),

lib = require('../../lib'),

config = require('../../config'),

async = require('async');

debug.enable('*');

var coms = require('../../coms')( config ),

log = debug('mailer-tests'),

forwardedCb,

task = require('../task')( config, coms )( function( err, params, data ) {

  if ( forwardedCb ) forwardedCb( err, params, data );

} );

describe( 'mailer', function() {

  before( function( done ) {

    log('queuing mail');

    coms.queue( 'mailer', {
      recipient: ['success@simulator.amazonses.com', 'success@simulator.amazonses.com' ],
      subject: 'this is a test mail',
      html: '<p>This really is a test mail</p>',
      text: 'This really is a test mail'
    }, done );

  });

  it( 'ses mailing is successful', function( done ) {

    this.timeout( 10000 );

    var i = 0;

    forwardedCb = function( err, params, data ) {

      log( 'got a reply from ses' );

      i++;

      should.not.exist( err );

      if ( i == 2 ) done();

    };

  });

  
  before( function( done ) {

    coms.queue( 'mailer', {
      recipient: 'bounce@simulator.amazonses.com',
      subject: 'please bounce me',
      html: '<p>Booing</p>',
      text: 'Booing'
    }, done );

  });


  it( 'ses mail bounce', function( done ) {

    forwardedCb = function( err, params, data ) {

      log( 'got a reply from ses' );

      should.not.exist( err );

      done();

    };

  });

});