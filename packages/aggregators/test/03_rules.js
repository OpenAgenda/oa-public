"use strict";

const should = require( 'should' );

const rules = require( '../lib/rules' );

describe( 'aggregation rules', () => {

  describe( 'evaluate tags', () => {

    const ruleset = [ {
      query: {
        tags: [ 'Tag1', 'Tag3' ]
      }
    }, {
      query: {
        tags: [ 'Tag2' ]
      },
      value: {
        state: 'tobecontrolled'
      }
    }, {
      value: {
        state: 'published'
      }
    } ];

    test( 'rules returns specified value of matches', () => {

      const event = {
        tags: [ 'Tag1', 'Tag2' ]
      }

      expect( rules( ruleset, event, 'value' ) ).toEqual( [
        null,
        { state: 'tobecontrolled' },
        { state: 'published' }
      ] );

    } );

    test( 'rules filters out non-matches', () => {

      const event = {
        tags: [ 'Tag1' ]
      }

      expect( rules( ruleset, event, 'value' ).length ).toBe( 2 );

    } );

  } );

  describe( 'evaluate custom', () => {

    test( 'rules handle fields of string, number or boolean types as well', () => {

      const ruleset = [ {
        query: {
          intercomunal_interest: true
        }
      } ];

      expect( rules( ruleset, { intercomunal_interest: false } ) ).toEqual( [] );

      expect( rules( ruleset, { intercomunal_interest: true } ) ).toEqual( [ null ] );

    } );

    test( 'rule passes if value in requested fields are truthy', () => {

      const ruleset = [ {
        truthy: [ 'intercomunal_interest' ]
      } ];

      expect( rules( ruleset, { intercomunal_interest: false } ) ).toEqual( [] );

      expect( rules( ruleset, { intercomunal_interest: true } ) ).toEqual( [ null ] );

      expect( rules( ruleset, { intercomunal_interest: [] } ) ).toEqual( [] );

      expect( rules( ruleset, { intercomunal_interest: [ 1 ] } ) ).toEqual( [ null ] );

    } );

  } );

  describe( 'evaluate location', () => {

    const event = {
      location: {
        name: 'La boutique',
        city: 'Paris',
        region: 'Ile-de-France'
      }
    };

    test( 'location evaluation requires all location fields to match filter', () => {

      const ruleset = [ {
        query: {
          location: {
            region: 'Ile-de-France',
            city: 'Courbevoie'
          }
        }
      } ];

      expect( rules( ruleset, event ) ).toEqual( [] );

    } );

    test( 'location evaluation matches if required rule fields match', () => {

      const ruleset = [ {
        query: {
          location: {
            region: 'Ile-de-France',
            city: 'Paris'
          }
        }
      } ];

      expect( rules( ruleset, event ) ).toEqual( [ null ] );

    } );

  } );

} );
