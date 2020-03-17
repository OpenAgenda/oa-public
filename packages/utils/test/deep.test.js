"use strict";

let utils = require( '../' );

describe( 'utils - deep', () => {

  it( 'should set deep value in object', () => {

    let obj = { settings: undefined };

    utils.deep.set( obj, 'settings.contribution.some.where', 'yey' );

    expect(obj).toEqual({
      settings: {
        contribution: {
          some: {
            where: 'yey'
          }
        }
      }
    });

  } );

  it( 'should return deep value when exists', () => {

    expect(utils.deep( {
      settings: {
        contribution: 'yey'
      }
    }, 'settings.contribution' )).toBe('yey');

  } );

  it( 'should return undefined when does not exist', () => {

    expect( utils.deep( {
      settings: {
        contribution: 'yey'
      }
    }, 'settings.ffdsfs' ) ).toBeUndefined();

  } );

} );
