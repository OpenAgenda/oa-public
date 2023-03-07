import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import qs from 'qs';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { unstable_batchedUpdates as unstableBatchedUpdates } from 'react-dom';
import { useIntl } from 'react-intl';
import { useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Portal } from '@openagenda/react-portal-ssr';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import { getEvents } from '../api';
import {
  filtersToAggregations,
  extractFiltersFromDom,
  extractWidgetsFromDom,
  withDefaultFilterConfig,
} from '../utils';
import { useGetFilterOptions, useGetTotal, useLoadGeoData } from '../hooks';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext';
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

const FiltersManager = React.forwardRef(function FiltersManager({
  aggregations: initialAggregations = {},
  query: initialQuery = {},
  total: initialTotal = 0,
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
  const widgetSeed = useUIDSeed();

  const {
    filters,
    widgets,
    setFilters,
    setWidgets,
    filtersOptions,
  } = useContext(FiltersAndWidgetsContext);

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
        null, // apiClient
        res,
        { uid: agendaUid },
        filters.filter(filter => filter.type === 'choice' && !filter.options),
        { size: 0 },
        null, // pageParam
        false, // filtersBase
      )).aggregations;
    },
    {
      initialData: initialFiltersBase,
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    },
  );

  const getOptions = useGetFilterOptions(intl, filtersBaseQuery.data, aggregations);
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(null, res, query);

  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getQuery: () => query,
    getForm: () => form,
    setAggregations,
    setQuery,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      const widgetsOnPage = extractWidgetsFromDom();
      const filtersOnPage = extractFiltersFromDom();

      const newFilters = filtersOnPage.map(nextFilter => {
        const completedNext = withDefaultFilterConfig(nextFilter, intl, filtersOptions);
        const found = filters.find(v =>
          JSON.stringify(omit(v, 'elemRef')) === JSON.stringify(omit(completedNext, 'elemRef')));

        // Conserve if found & elem has not changed
        return found && document.body.contains(found.elem) ? found : completedNext;
      });

      const newWidgets = widgetsOnPage.map(nextWidget => {
        const found = widgets.find(v =>
          JSON.stringify(omit(v, 'elemRef')) === JSON.stringify(omit(nextWidget, 'elemRef')));

        // Conserve if found & elem has not changed
        return found && document.body.contains(found.elem) ? found : nextWidget;
      });

      // Because re-render filters separatly to widgets throws an error
      unstableBatchedUpdates(() => {
        if (!isEqual(filters, newFilters)) {
          setFilters(newFilters);
        }

        if (!isEqual(widgets, newWidgets)) {
          setWidgets(newWidgets);
        }

        setAggregations(result.aggregations || []);
        setTotal(result.total || 0);
        setQuery(values);
      });

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
        `${window.location.pathname}${queryStr}`,
      );
    },
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
              <ActiveFilters
                agendaUid={agendaUid}
                filters={filters}
                getOptions={getOptions}
              />
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
        missingValue={filtersOptions.missingValue}
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

const Wrapper = forwardRef(function Wrapper(props, ref) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <FiltersManager ref={ref} {...props} />
    </QueryClientProvider>
  );
});

export default Wrapper;
