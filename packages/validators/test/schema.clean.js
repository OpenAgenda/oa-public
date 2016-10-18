"use strict";

const should = require( 'should' ),

clean = require( './build/schema/clean' );

describe( 'schema clean', () => {

  it( 'clean adds fields to fieldless structure', () => {

    clean( {
      title: {
        type: 'text'
      },
      settings: {
        credentials: {
          type: 'boolean'
        },
        info: {
          type: 'text'
        }
      }
    } )

    .should.eql( {
      list: false,
      type: 'schema',
      fields: {
        title: {
          type: 'text'
        },
        settings: {
          type: 'schema',
          list: false,
          fields: {
            credentials: {
              type: 'boolean'
            },
            info: {
              type: 'text'
            }
          }
        }
      }
    } );

  } );

} );