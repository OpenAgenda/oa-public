import _ from 'lodash';
import qs from 'qs';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { useIntl } from 'react-intl';
import { useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useQuery } from 'react-query';
import { Portal } from '@openagenda/react-portal-ssr';
import useApiClient from '@openagenda/react-shared/lib/hooks/useApiClient';
import { getEvents } from '../api';
import { withDefaultFilterConfig, filtersToAggregations, getWidgets } from '../utils';
import { useGetFilterOptions, useGetTotal, useLoadGeoData } from '../hooks';
import Filters from './Filters';
import ActiveFilters from './ActiveFilters';
import FavoriteToggle from './FavoriteToggle';
import Total from './Total';
import ChoiceFilter from './filters/ChoiceFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import DefinedRangeFilter from './filters/DefinedRangeFilter';
import SearchFilter from './filters/SearchFilter';
import MapFilter from './filters/MapFilter';
import CustomFilter from './filters/CustomFilter';
import FavoritesFilter from './filters/FavoritesFilter';

export default React.forwardRef(function FiltersManager({
  filters: rawFilters,
  widgets: initialWidgets,
  aggregations: initialAggregations = {},
  query: initialQuery = {},
  total: initialTotal = 0,
  missingValue = false,
  mapTiles,
  defaultViewport,
  res,
  filtersBase: initialFiltersBase,
  agendaUid,
  onLoad,

  choiceComponent = ChoiceFilter,
  dateRangeComponent = DateRangeFilter,
  definedRangeComponent = DefinedRangeFilter,
  searchComponent = SearchFilter,
  mapComponent = MapFilter,
  customComponent = CustomFilter,
  favoritesComponent = FavoritesFilter,

  ...rest
}, ref) {
  const intl = useIntl();
  const form = useForm();
  const axios = useApiClient();
  const widgetSeed = useUIDSeed();

  const filters = useMemo(
    () => rawFilters.map(rawFilter => withDefaultFilterConfig(rawFilter, intl, { missingValue, mapTiles })),
    [rawFilters, intl, missingValue, mapTiles]
  );
  const [widgets, setWidgets] = useState(() => initialWidgets);

  const [query, setQuery] = useState(() => initialQuery);
  const [total, setTotal] = useState(() => initialTotal);

  const [aggregations, setAggregations] = useState(() => initialAggregations);

  const filtersBaseQuery = useQuery(
    ['react-filters', 'filtersBase', agendaUid],
    async () => {
      const filtersToLoad = filters.filter(filter => filter.type === 'choice' && !filter.options);

      if (!filtersToLoad.length) {
        return {};
      }

      return (await getEvents(
        axios,
        res,
        { uid: agendaUid },
        filters.filter(filter => filter.type === 'choice' && !filter.options),
        { size: 0 }
      )).aggregations;
    },
    {
      initialData: initialFiltersBase,
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
  );

  const getOptions = useGetFilterOptions(intl, filtersBaseQuery.data, aggregations);
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(axios, res, query);

  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getQuery: () => query,
    getForm: () => form,
    setAggregations,
    setQuery,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      const widgetsOnPage = getWidgets();

      setWidgets(widgetsOnPage.reduce((accu, next) => {
        const found = widgets.find(v => _.isEqual(v, next));

        // Conserve if found & elem has not changed
        if (found && (!found.elem || document.body.contains(found.elem))) {
          accu.push(found);
          return accu;
        }

        accu.push(next);

        return accu;
      }, []));

      setAggregations(result.aggregations || []);
      setTotal(result.total || 0);
      setQuery(values);

      const mapFilter = filters.find(v => v.type === 'map');
      const mapElem = mapFilter?.elemRef?.current;
      const viewport = result.aggregations?.viewport;

      if (mapElem && viewport) {
        mapElem.onQueryChange(viewport);
      }
    },
    updateLocation: values => {
      const queryStr = qs.stringify(values, { addQueryPrefix: true, skipNulls: true });

      window.history.pushState(
        {},
        null,
        `${window.location.pathname}${queryStr}`
      );
    }
  }));

  useEffect(() => {
    if (typeof onLoad === 'function') {
      const aggs = filtersToAggregations(filters);

      onLoad(query, aggs, form);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              <ActiveFilters agendaUid={agendaUid} filters={filters} getOptions={getOptions} />
            </span>
          </Portal>
        );
      case 'favorite':
        return (
          <Portal key={widgetSeed(widget)} selector={widget.destSelector}>
            <span>
              <FavoriteToggle agendaUid={agendaUid} widget={widget} {...widget} />
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
        agendaUid={agendaUid}
        missingValue={missingValue}
        // filters
        choiceComponent={choiceComponent}
        dateRangeComponent={dateRangeComponent}
        definedRangeComponent={definedRangeComponent}
        searchComponent={searchComponent}
        mapComponent={mapComponent}
        customComponent={customComponent}
        favoritesComponent={favoritesComponent}
        {...rest}
      />
      {widgetElems}
    </>
  );
});
