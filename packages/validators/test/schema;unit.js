"use strict";

const _ = require( 'lodash' );

require( 'source-map-support' ).install();

const should = require( 'should' );

const utils = require( '../src/schema/utils' );

const registered = {
  text: require( '../src/text' )
}

describe( 'schema functions ( unit tests )', () => {

  before( () => {

    utils.registerValidators( registered );

  } );

  describe( 'mapValuesToValidators', () => {

    it( 'flattens given values into a single list and associates corresponding validators', () => {

      const flattened = utils.mapValuesToValidators( 
        // fields object
        { title: { type: 'text', min: 2 } }, 
        // values
        { title: 'This is the first getFlat test' }
      );

      flattened.length.should.equal( 1 );

      _.keys( flattened[ 0 ] ).should.eql( [ 'field', 'validator', 'value' ] );

      _.pick( flattened[ 0 ], [ 'field', 'value' ] ).should.eql( {
        field: 'title',
        value: 'This is the first getFlat test'
      } );

    } );

    it( 'flattens deep schemas', () => {

      const flattened = utils.mapValuesToValidators(
        // fields object
        {
          title: { type: 'text', min: 2 },
          author: {
            type: 'schema',
            fields: {
              name: { type: 'text' },
              surname: { type:'text' }
            }
          }
        },
        // values
        {
          title: 'My Reign',
          author: {
            name: 'The',
            surname: 'Queen'
          }
        }
      );

      flattened.length.should.equal( 2 );

      flattened.map( f => _.pick( f, [ 'field', 'value' ] ) ).should.eql( [ {
        field: 'title',
        value: 'My Reign',
      }, {
        field: 'author',
        value: {
          name: 'The',
          surname: 'Queen'
        }
      } ] );

    } );

  } );

} );
