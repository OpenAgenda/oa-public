import '@openagenda/bs-templates/compiled/main.css';

import SearchInput from '../src/components/SearchInput.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';

export default {
  title: 'SearchInput',
  decorators: [ComponentCanvas],
};

export const test = () => (
  <SearchInput
    placeholder="Search..."
    onChange={(value) => console.log(value)}
  />
);
