// const chai = require( 'chai' );
// const chaiAsPromised = require( 'chai-as-promised' );
// const chaiJestDiff = require( 'chai-jest-diff' ).default;
//
// chai.use( chaiAsPromised );
// chai.use( chaiJestDiff() );
//
// global.jestExpect = global.expect;

// eslint-disable-next-line no-global-assign
import Promise from 'bluebird';

Promise.config( {
  longStackTraces: true
} );
