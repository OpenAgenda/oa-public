"use strict";

const clean = require( '../src/schema/clean' );

describe( 'schema clean', () => {

  it( 'fields of known types are read as leaves ( not schema validators )', () => {

    expect(clean( {
      search: { 
        type: 'text', 
        optional: true, 
        default: null 
      },
      official: {
        type: 'boolean',
        optional: true,
        default: null 
      },
      sort: {
        type: 'regex',
        optional: true,
        error: { code: 'sort.invalid', message: 'sort value is not valid' },
        regex: /createdAt\.desc/,
        default: null 
      }
    } )).toEqual({
      list: false,
      type: 'schema',
      fields: {
        search: {
          type: 'text',
          optional: true,
          default: null
        },
        official: {
          type: 'boolean',
          optional: true,
          default: null 
        },
        sort: {
          type: 'regex',
          optional: true,
          error: { code: 'sort.invalid', message: 'sort value is not valid' },
          regex: /createdAt\.desc/,
          default: null 
        }
      }
    });

  } );

  it( 'clean adds fields to fieldless structure', () => {

    expect(clean( {
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
    } )).toEqual({
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
    });

  } );

} );