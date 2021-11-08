import _ from 'lodash';
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { useIntl } from 'react-intl';
import { useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useQuery } from 'react-query';
import { Portal } from '@stefanoruth/react-portal-ssr';
import { useApiClient } from '@openagenda/react-shared';
import { getEvents } from '../api';
import { withDefaultFilterConfig } from '../utils';
import Filters from './Filters';
import ActiveFilters from './ActiveFilters';
import Total from './Total';
import ChoiceFilter from './filters/ChoiceFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import DefinedRangeFilter from './filters/DefinedRangeFilter';
import SearchFilter from './filters/SearchFilter';
import MapFilter from './filters/MapFilter';
import CustomFilter from './filters/CustomFilter';

export default React.forwardRef(function FiltersManager({
  filters: rawFilters,
  widgets,
  initialAggregations = {},
  initialQuery = {},
  initialTotal = 0,
  defaultViewport,
  res,
  filtersBase: initialFiltersBase,
  agendaUid,

  choiceComponent = ChoiceFilter,
  dateRangeComponent = DateRangeFilter,
  definedRangeComponent = DefinedRangeFilter,
  searchComponent = SearchFilter,
  mapComponent = MapFilter,
  customComponent = CustomFilter,

  ...rest
}, ref) {
  const intl = useIntl();
  const form = useForm();
  const axios = useApiClient();
  const widgetSeed = useUIDSeed();

  const filters = useMemo(
    () => rawFilters.map(rawFilter => withDefaultFilterConfig(rawFilter, intl)),
    [rawFilters, intl]
  );

  const [query, setQuery] = useState(() => initialQuery);
  const [total, setTotal] = useState(() => initialTotal);

  const [aggregations, setAggregations] = useState(() => initialAggregations);

  const filtersBaseQuery = useQuery(
    ['react-filters', 'filtersBase', agendaUid],
    async () => (await getEvents(
      axios,
      res,
      { uid: agendaUid },
      filters.filter(filter => filter.type === 'choice' && !filter.options),
      { size: 0 }
    )).aggregations,
    {
      initialData: initialFiltersBase,
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
  );

  const getOptions = useCallback(
    filter => {
      if (filter.options) return filter.options;

      const baseAgg = [...filtersBaseQuery.data[filter.name]];

      aggregations[filter.name].forEach(entry => {
        const dataKey = 'id' in entry ? 'id' : 'key';
        const found = baseAgg.find(v => v[dataKey] === entry[dataKey]);
        if (!found) baseAgg.push(entry);
      });

      if (!baseAgg) return [];

      const labelKey = filter.labelKey || 'key';

      return baseAgg.map(v => ({
        label: _.get(v, labelKey),
        value: v.key,
      }));
    },
    [aggregations, filtersBaseQuery.data]
  );

  const getTotal = useCallback(
    (filter, option) => {
      const aggregation = aggregations[filter.name];

      if (!aggregation) return null;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = aggregation.find(
        v => String(v[dataKey]) === String(option[optionKey])
      );

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [aggregations]
  );

  const loadGeoData = useCallback(
    async (filter, bounds, zoom) => {
      const northEast = bounds.getNorthEast().wrap();
      const southWest = bounds.getSouthWest().wrap();

      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        aggregations: [
          {
            type: 'geohash',
            size: 2000,
            zoom: Math.max(zoom, 1),
            radius: zoom === 0 ? 80 : 40
          },
        ],
        geo: {
          northEast,
          southWest,
        },
      };

      const result = (await axios.get(res, { params })).data;

      return result.aggregations.geohash;
    },
    [axios, query, res]
  );

  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getQuery: () => query,
    getForm: () => form,
    setAggregations,
    setQuery,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      setAggregations(result.aggregations);
      setTotal(result.total);
      setQuery(values);

      const mapFilter = filters.find(v => v.type === 'map');
      const mapElem = mapFilter?.elemRef?.current;
      const { viewport } = result.aggregations;

      if (mapElem && viewport) {
        mapElem.onQueryChange(viewport);
      }
    }
  }));

  const widgetElems = widgets.map(widget => {
    switch (widget.name) {
      case 'total':
        return (
          <Portal key={widgetSeed(widget)} selector={widget.destSelector}>
            <span>
              <Total message={widget.message} total={total} />
            </span>
          </Portal>
        );
      case 'activeFilters':
        return (
          <Portal key={widgetSeed(widget)} selector={widget.destSelector}>
            <span>
              <ActiveFilters filters={filters} getOptions={getOptions} />
            </span>
          </Portal>
        );
      default:
        return null;
    }
  });

  return (
    <>
      <Filters
        withRef
        filters={filters}
        getOptions={getOptions}
        getTotal={getTotal}
        initialViewport={initialAggregations.viewport}
        defaultViewport={defaultViewport}
        loadGeoData={loadGeoData}
        query={query}
        // filters
        choiceComponent={choiceComponent}
        dateRangeComponent={dateRangeComponent}
        definedRangeComponent={definedRangeComponent}
        searchComponent={searchComponent}
        mapComponent={mapComponent}
        customComponent={customComponent}
        {...rest}
      />
      {widgetElems}
    </>
  );
});
