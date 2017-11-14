/**
 * create a bogus coms module and check that
 * events are correctly sent to it as newsletter task runs,
 *
 * .. processing newsletters that need to be sent right away.
 */

process.env.NODE_ENV = 'test';

var config = require( '../../config' ),

log = require( '@openagenda/logger' )( 'newsletter task tests' ),

async = require('async'),

should = require('should'),

bogusComs = require( '../../test/helpers/bogusComs' ),

task = require( '../task' ),

campaignHelpers = require( './helpers/campaigns' ),

emails = [ 'poney@cibul.net', 'bisounours@cibul.net', 'cali@cibul.net' ];


// it is the task that is being tested here, not the coms module
// bogus coms queues things on a js stack rather than using redis
task.setComs( bogusComs );


log( 'running newsletter task tests' );

describe('campaign launcher task', function() {

  beforeEach( function( done ) {

    campaignHelpers.prepare( { emails: emails }, done );

  });


  it( 'one item should be stored in coms module', function( done ) {

    task.setOnComplete( function() {

      log( 'the deed is done.' );

      bogusComs.consume( 'mailer', function( err, data ) {

        should.not.exist( err );
        should.exist( data );

        done();

      } );
      
    } );

    task.run();


  });


  it( 'recipient should match emails set as contacts in campaign contact list', function( done ) {

    task.setOnComplete( function() {

      bogusComs.consume( 'mailer', function( err, data ) {

        var recipients = data.recipient;

        recipients.should.eql( emails );

        done();

      });
      
    });

    task.run();

  } );


  it( 'subject and body should be defined', function( done ) {

    task.setOnComplete( function() {

      bogusComs.consume( 'mailer', function( err, data ) {

        var decoded = data;

        decoded.should.have.property( 'subject' );

        decoded.should.have.property( 'html' );

        decoded.should.have.property( 'text' );

        done();

      });

    });

    task.run();

  });

});