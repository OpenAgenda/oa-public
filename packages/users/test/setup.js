const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const chaiJestDiff = require( 'chai-jest-diff' ).default;

chai.use( chaiAsPromised );
chai.use( chaiJestDiff() );

Promise = require( 'bluebird' );

Promise.config( {
  longStackTraces: true
} );
