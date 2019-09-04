import chai, { expect } from 'chai';
import chaiJestDiff from 'chai-jest-diff';
import chaiAsPromised from 'chai-as-promised';

jest.setTimeout( 15000 );

chai.use( chaiAsPromised );
chai.use( chaiJestDiff() );

chai.should();
global.expect = expect;
global.should = expect;
