import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiJestDiff from 'chai-jest-diff';
import chaiJestSnapshot from 'chai-jest-snapshot';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createSerializer } from 'enzyme-to-json';
import 'jest-enzyme';

jest.setTimeout( 15000 );

chai.use( chaiAsPromised );
chai.use( chaiJestDiff() );
chai.use( chaiJestSnapshot );

Enzyme.configure( { adapter: new Adapter() } );
expect.addSnapshotSerializer( createSerializer() );

