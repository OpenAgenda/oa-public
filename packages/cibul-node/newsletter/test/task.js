/**
 * create a bogus coms module and check that
 * events are correctly sent to it as task runs
 * going through campaigns that need to be sent
 */

process.env.NODE_ENV = 'testing';

var config = require('../../config'),

debug = require('debug'),

async = require('async'),

should = require('should'),

bogusComs = require('./helpers/bogusComs'),

// task to be tested

task = require( '../task' );

debug.enable( '*' );

var log = debug('newsletter-task-tests'),

campaignHelpers = require('./helpers/campaigns'),

emails = [ 'poney@cibul.net', 'bisounours@cibul.net', 'cali@cibul.net' ];

log( 'running newsletter task tests' );

describe('campaign launcher task', function() {


  beforeEach( function( done ) {

    async.series( [
      async.apply( campaignHelpers.prepare, { emails: emails } ),
      task( config, bogusComs )
    ], done );

  });


  it( 'one item should be stored in coms module', function( done ) {

    bogusComs.consume( 'mailer', function( err, data ) {

      should.not.exist( err );
      should.exist( data );

      done();

    });

  });


  it( 'recipient should matched emails set as contacts in campaign contact list', function( done ) {

    bogusComs.consume( 'mailer', function( err, data ) {

      var recipients = JSON.parse( data ).recipient;

      recipients.should.eql( emails );

      done();

    });

  } );


  it( 'subject and body should be defined', function( done ) {

    bogusComs.consume( 'mailer', function( err, data ) {

      var decoded = JSON.parse( data );

      decoded.should.have.property( 'subject' );

      decoded.should.have.property( 'body' );

      done();

    });

  });


});