/**
 * test queue and consume features
 */

process.env.NODE_ENV = 'testing';

var config = require('../config'),

debug = require('debug'),

should = require('should'),

coms = require('../coms')( config );

debug.enable('*');

var log = debug('coms-tests');

describe( 'testing persistent queue', function() {

  it( '#persistentConsume', function( done ) {

    var i = 0;

    coms.persistentConsume( 'test', function( err, data ) {

      i++;

      if ( i==3 ) {

        data.should.have.property( 'third', 'data');

        done();

      }

    });

    coms.queue( 'test', { some: 'data' });

    setTimeout( function() {

      coms.queue( 'test', { someMore: 'randomData' } );

    }, 100 );

    setTimeout( function() {

      coms.queue( 'test', { third: 'data' } );

    }, 300 );

  } );

});