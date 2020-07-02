import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createSerializer as createEnzymeSerializer } from 'enzyme-to-json';
import { createSerializer as createEmotionSerializer } from 'jest-emotion';

configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createEnzymeSerializer({ mode: 'deep' }));
expect.addSnapshotSerializer(createEmotionSerializer());
