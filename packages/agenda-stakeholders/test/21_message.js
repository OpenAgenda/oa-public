"use strict";

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );
const queue = require( 'queue' );

describe( 'agenda-stakeholders - functional (server): message forwarding', function () {

  // c'est bien la peine d'avoir un core i7
  this.timeout( 40000 );

  const queueTestConfig = {
      names: {
        message: 'stakeholderMessageTest'
      },
      redis: {
        host: 'localhost',
        port: 6379
      }
    },

    q = queue( queueTestConfig.names.message, { redis: queueTestConfig.redis } );

  before( done => {

    service.initAndLoad( _.extend( {}, config, {
      queue: queueTestConfig
    } ), done );

  } );

  beforeEach( done => {

    q.test.clear( err => {

      done();

    } );

  } );


  it( '.tasks.message calls onMessage interface for targeted users', done => {

    let i = 0, expected = 4, t; // there are 4 non-zero counter stakeholders in fixtures

    // for testing: overload interface function onMessage
    service.init( _.extend( {}, config, {
      queue: queueTestConfig,
      interfaces: _.extend( {}, config.interfaces, {
        onMessage: ( stakeholder, message, context, cb ) => {

          i++;

          stakeholder.actionsCounter.should.not.equal( 0 );

          message.should.equal( '**remember how she said that we would meet again**' );

          cb();

          if ( i === 4 ) {

            done();

          }

        }
      } )
    } ), () => {

      // first argument is query for list. Here message will be sent to "active" stakeholders.
      // The first use case for this will be: { actionsCounterEqualZero: true, deletedUser: false }
      service.agenda( 4608 ).message(
        { actionsCounterEqualZero: false },
        '**remember how she said that we would meet again**',
        { lang: 'fr' },
        () => {}
      );

      // run task
      service.tasks.message();

    } );


  } );

} );