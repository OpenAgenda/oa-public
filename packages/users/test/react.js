"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  actions = require( '../react/actions' ),

  userSettingsReduer = require( '../react/reducers/userSettings' );


describe( 'react', function() {

  this.timeout( 10000 );

  it( 'getMe', done => {

    const user = {
      fullname: 'Mon user test',
      culture: 'fr',
      email: 'test@test.fr'
    };

    userSettingsReduer( {}, actions.getMe( 'response', { user } ) ).should.eql( { user } );

    done();

  } );

} );