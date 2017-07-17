"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  config = require( '../testconfig' ),

  schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  text: require( 'validators/text' )
} );

describe( 'extended events - functional (server): get', function() {

  beforeEach( async () => {

    await svc.initAndLoad( ih( config, {
      interfaces: {
        getValidator: { $set: formSchemaId => {

          return schema( {
            edition: {
              type: 'integer'
            },
            contender: {
              type: 'text'
            }
          } );

        } }
      }
    } ) );

  } );

  beforeEach( async () => {

    const fixtures = [
      [ 111, 0, 'steve' ],
      [ 222, 1, 'jeff' ],
      [ 333, 2, 'bob' ],
      [ 444, 3, 'bill' ],
      [ 555, 4, 'john' ],
      [ 666, 5, 'bobby' ],
      [ 777, 6, 'zoubi' ],
      [ 888, 7, 'cindy' ],
      [ 999, 8, 'nelly' ],
      [ 123, 9, 'pinky' ],
      [ 837, 10, 'sugar' ],
      [ 849, 11, 'djeneene' ],
      [ 897, 12, 'tony' ],
      [ 901, 13, 'mikey' ]
    ];

    for ( let entry of fixtures ) {

      await svc( 29 ).create( entry[ 0 ], {
        edition: entry[ 1 ],
        contender: entry[ 2 ]
      } );

    }

  } )

  it( 'list custom data by form schema id', async () => {

    ( await svc( 29 ).list( {}, 3, 5 ) ).items.should.eql( [ 
      { edition: 3, contender: 'bill' },
      { edition: 4, contender: 'john' },
      { edition: 5, contender: 'bobby' },
      { edition: 6, contender: 'zoubi' },
      { edition: 7, contender: 'cindy' } 
    ] );

  } );

  it( 'list gives total', async () => {

    ( await svc( 29 ).list( {}, 30, 5 ) ).total.should.equal( 14 );

  } );

  it( 'list can target specific identifiers', async () => {

    ( await svc( 29 ).list( { identifier: [ 123, 837 ] }, 0, 20 ) ).items.should.eql( [
      { edition: 9, contender: 'pinky' },
      { edition: 10, contender: 'sugar' }
    ] );

  } );

} );