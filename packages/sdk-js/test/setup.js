import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiJestDiff from 'chai-jest-diff';

chai.use( chaiAsPromised );
chai.use( chaiJestDiff() );
