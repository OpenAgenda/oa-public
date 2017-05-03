"use strict";

const should = require( 'should' );

const rules = require( '../lib/rules' );

describe( 'aggregation rules', () => {

  let ruleset = [ {
    query: {
      tags: [ 'Tag1' ]
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

  it( 'rules returns specified value of matches', () => {

    let event = {
      tags: [ 'Tag1', 'Tag2' ]
    }

    rules( ruleset, event, 'value' )

    .should.eql( [ 
      null,
      { state: 'tobecontrolled' },
      { state: 'published' }
    ] )

  } );

  it( 'rules filters out non-matches', () => {

    let event = {
      tags: [ 'Tag1' ]
    }

    rules( ruleset, event, 'value' ).length.should.equal( 2 );

  } );


  it( 'rules handle fields of string, number or boolean types as well', () => {

    let ruleset = [ {
      query: {
        intercomunal_interest: true
      }
    } ]

    rules( ruleset, { intercomunal_interest: false } )

      .should.eql( [] );

    rules( ruleset, { intercomunal_interest: true } )

      .should.eql( [ null ] );

  } );

} );