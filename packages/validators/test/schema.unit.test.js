"use strict";

const _ = require( 'lodash' );

const utils = require( '../src/schema/utils' );

const registered = {
  schema: require( '../src/schema' ),
  text: require( '../src/text' )
}

describe( 'schema functions ( unit tests )', () => {

  beforeAll( () => {

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

      expect(flattened.length).toBe(1);

      expect(_.keys( flattened[ 0 ] )).toEqual([ 'field', 'validator', 'value', 'isEnabled' ]);

      expect(_.pick( flattened[ 0 ], [ 'field', 'value' ] )).toEqual({
        field: 'title',
        value: 'This is the first getFlat test'
      });

    } );

    it( 'flatten filters out fields that are enabled only with values submitted for other fields', () => {

      const flattened = utils.mapValuesToValidators( {
        name: { type: 'text' },
        image: { type: 'text' },
        credits: { type: 'text', enableWith: 'image' }
      }, {
        name: 'Jeff',
        image: null,
        credits: 'Nobody'
      } );

      expect(flattened.length).toBe(3);

      expect(flattened.map( f => f.value )).toEqual([ 'Jeff', null, 'Nobody' ]);
      expect(flattened.map( f => f.isEnabled )).toEqual([ true, true, false ]);

    } );

    it( 'flatten renders optional fields that were required but are not enabled', () => {

      const flattened = utils.mapValuesToValidators( {
        image: { type: 'text' },
        credits: { type: 'text', enableWith: 'image', optional: false }
      }, {
        image: null,
        credits: null
      } );

      let errored = false;

      try {

        flattened[ 1 ].validator();

      } catch ( e ) {

        errored = true;

      }

      expect(errored).toBe(false);

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

      expect(flattened.length).toBe(2);

      expect(flattened.map( f => _.pick( f, [ 'field', 'value' ] ) )).toEqual([ {
        field: 'title',
        value: 'My Reign',
      }, {
        field: 'author',
        value: {
          name: 'The',
          surname: 'Queen'
        }
      } ]);

    } );

  } );

} );
