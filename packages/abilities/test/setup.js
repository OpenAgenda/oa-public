// const chai = require( 'chai' );
// const chaiAsPromised = require( 'chai-as-promised' );
// const chaiJestDiff = require( 'chai-jest-diff' ).default;
//
// chai.use( chaiAsPromised );
// chai.use( chaiJestDiff() );
//
// global.jestExpect = global.expect;

import registerRequireContextHook from 'babel-plugin-require-context-hook/register';

registerRequireContextHook();
