"use strict";

process.env.NODE_ENV = 'test';

var config = require( '../../config' ),

async = require( 'async' ),

should = require( 'should' ),

cmn = require( '../../lib/commons-task' ),

cbm = cmn.getCibulModel(),

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

task = require( '../oembed.task.js' ),

bogusComs = require( '../../test/helpers/bogusComs' );

task.setComs( bogusComs );

describe( 'oembed task - job creation', function( ) {

  var eInst = {};

  before( fixtureSets.prepareOneEventInstance( eInst, 'evenement-multimedia' ) );

  it( 'job is created with expected structure', function( done ) {

    task.setOnComplete( function() {

      bogusComs.consume( config.jobsQueue, function( err, values ) {

        values.type.should.equal( 'event/oembed' );

        values.action.should.equal( 'process' );

        values.id.should.equal( eInst.id );  
        
        done();

      } );

    });  

    task.run();

    bogusComs.publish( config.mainChannel, {
      name: 'event.publish', 
      values: { 
        id: eInst.id 
      } 
    });

  });
  
} );