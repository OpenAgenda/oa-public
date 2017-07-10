"use strict";

let should = require( 'should' ),

utils = require( '../' );

describe( 'utils - deep', () => {

  it( 'should set deep value in object', () => {

    let obj = { settings: undefined };

    utils.deep.set( obj, 'settings.contribution.some.where', 'yey' );

    obj.should.eql( {
      settings: {
        contribution: {
          some: {
            where: 'yey'
          }
        }
      }
    } );

  } );

  it( 'should return deep value when exists', () => {

    utils.deep( {
      settings: {
        contribution: 'yey'
      }
    }, 'settings.contribution' )

    .should.equal( 'yey' );

  } );

  it( 'should return undefined when does not exist', () => {

    should( utils.deep( {
      settings: {
        contribution: 'yey'
      }
    }, 'settings.ffdsfs' ) )

    .equal( undefined );

  } );

} );