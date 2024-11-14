import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiJestDiff from 'chai-jest-diff';
import chaiJestSnapshot from 'chai-jest-snapshot';
import Enzyme from 'enzyme';
import AdapterModule from '@cfaester/enzyme-adapter-react-18';
import { createSerializer } from 'enzyme-to-json';
// import 'jest-enzyme';

const Adapter = AdapterModule.default || AdapterModule;

const { jest } = import.meta;

jest.setTimeout(15000);

chai.use(chaiAsPromised);
chai.use(chaiJestDiff.default());
chai.use(chaiJestSnapshot);

Enzyme.configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }));

// Fix `loadable`s
global.__webpack_require__ = true;
