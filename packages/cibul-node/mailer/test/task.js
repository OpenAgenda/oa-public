/**
 * test mailer task
 *
 * ideally bounces and such should be handled by a task via sns
 */

process.env.NODE_ENV = 'test';


var log = require('../../lib/logger')( 'mailer-tests' ),

should = require('should'),

lib = require( '../../lib/lib' ),

config = require( '../../config' ),

async = require('async'),

coms = require('../../lib/coms'),

task = require('../task');


describe( 'mailer', function() {

  var resultCb;

  before( function( done ) {

    this.timeout( 20000 );

    log( 'run task' );

    task.setOnReady( done );

    task.run();

  });

  it( 'ses mailing is successful', function( done ) {

    var i = 0;

    this.timeout( 10000 );

    task.setOnProcessed( function( err, params, data ) {

      log( 'got a reply from ses' );

      i++;

      should.not.exist( err );

      if ( i == 2 ) done();

    })

    log( 'queuing mail' );

    coms.queue( 'mailer', {
      recipient: [ 'success@simulator.amazonses.com', 'success@simulator.amazonses.com' ],
      subject: 'this is a test mail',
      html: '<p>This really is a test mail</p>',
      text: 'This really is a test mail'
    }, done );

  });


  it( 'ses email bounce', function( done ) {

    task.setOnProcessed( function( err, params, data ) {

      log( 'got a reply from ses' );

      should.not.exist( err );

      done();

    });


    log( 'queuing bounce email' );

    coms.queue( 'mailer', {
      recipient: 'bounce@simulator.amazonses.com',
      subject: 'please bounce me',
      html: '<p>Booing</p>',
      text: 'Booing'
    }, done );

  });

  after( function() {

    task.shutdown();

  });

});