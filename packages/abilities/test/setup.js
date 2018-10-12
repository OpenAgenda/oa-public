// const chai = require( 'chai' );
// const chaiAsPromised = require( 'chai-as-promised' );
// const chaiJestDiff = require( 'chai-jest-diff' ).default;
//
// chai.use( chaiAsPromised );
// chai.use( chaiJestDiff() );
//
// global.jestExpect = global.expect;

import Promise from 'bluebird';
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';

registerRequireContextHook();

// eslidsqnt-disable-next-line no-global-assign
global.Promise = Promise;

Promise.config( {
  longStackTraces: true
} );
