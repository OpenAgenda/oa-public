"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'activities - feed', function () {

  this.timeout( 60000 );

  describe( 'without config', () => {

    it( 'use feed method throw an error', () => {

      (() => {

        service.feed( 'user', 1 ).create();

      }).should.throw( 'service not initialized' );


    } );

  } );

  describe( 'with config', () => {

    before( done => {

      service.initAndLoad( config, [], {}, done );

    } );


    it( 'call feed method with bad entity type', () => {

      (() => {

        service.feed( 'badybad', 1 ).create();

      }).should.throw( 'You cannot use feed of type badybad' );

    } );


    it( 'call feed method with a good entity type', () => {

      (() => {

        service.feed( 'user', 1 ).create();

      }).should.not.throw( 'You cannot use feed of type user' );

    } );


    describe( 'create', () => {

      it( 'create an user feed', () => {

        (() => {

          service.feed( 'user', 1 ).create();

        }).should.not.throw( 'You cannot use feed of type user' );

      } );

    } )

  } );

} );