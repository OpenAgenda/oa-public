'use strict';

const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const chaiJestDiff = require( 'chai-jest-diff' ).default;

chai.use( chaiAsPromised );
chai.use( chaiJestDiff() );

// eslint-disable-next-line no-global-assign
Promise = require( 'bluebird' );

Promise.config( {
  longStackTraces: true
} );
