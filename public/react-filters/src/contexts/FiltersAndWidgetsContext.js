import { createContext } from 'react';

const FiltersAndWidgetsContext = createContext({
  filters: [],
  widgets: [],
  setFilters: () => {},
  setWidgets: () => {},
  filtersOptions: {},
});

export default FiltersAndWidgetsContext;
