import omit from 'lodash/omit.js';
import isEqual from 'lodash/isEqual.js';
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
import { useConstant } from '@openagenda/react-shared';
import { getEvents } from '../api/index.js';
import {
  filtersToAggregations,
  extractFiltersFromDom,
  extractWidgetsFromDom,
  withDefaultFilterConfig,
} from '../utils/index.js';
import {
  useGetFilterOptions,
  useGetTotal,
  useLoadGeoData,
} from '../hooks/index.js';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext.js';
import Filters from './Filters.js';
import ActiveFilters from './ActiveFilters.js';
import FavoriteToggle from './FavoriteToggle.js';
import Total from './Total.js';
import ChoiceFilter from './filters/ChoiceFilter.js';
import DateRangeFilter from './filters/DateRangeFilter.js';
import SimpleDateRangeFilter from './filters/SimpleDateRangeFilter.js';
import DefinedRangeFilter from './filters/DefinedRangeFilter.js';
import NumberRangeFilter from './filters/NumberRangeFilter.js';
import SearchFilter from './filters/SearchFilter.js';
import MapFilter from './filters/MapFilter.js';
import CustomFilter from './filters/CustomFilter.js';
import FavoritesFilter from './filters/FavoritesFilter.js';

const FiltersManager = React.forwardRef(function FiltersManager(
  {
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
    simpleDateRangeComponent = SimpleDateRangeFilter,
    definedRangeComponent = DefinedRangeFilter,
    numberRangeComponent = NumberRangeFilter,
    searchComponent = SearchFilter,
    mapComponent = MapFilter,
    customComponent = CustomFilter,
    favoritesComponent = FavoritesFilter,

    ...rest
  },
  ref,
) {
  const intl = useIntl();
  const form = useForm();
  const widgetSeed = useUIDSeed();

  const {
    filters,
    widgets,
    setFilters,
    setWidgets,
    filtersOptions,
    searchMethod,
  } = useContext(FiltersAndWidgetsContext);

  const [total, setTotal] = useState(() => initialTotal);
  const [aggregations, setAggregations] = useState(() => initialAggregations);

  const filtersBaseQuery = useQuery(
    ['react-filters', 'filtersBase', agendaUid],
    async () => {
      const filtersToLoad = filters.filter(
        (filter) => filter.type === 'choice' && !filter.options,
      );

      if (!filtersToLoad.length) {
        return {};
      }

      return (
        await getEvents(
          null, // apiClient
          res,
          { uid: agendaUid },
          filters.filter(
            (filter) => filter.type === 'choice' && !filter.options,
          ),
          { size: 0 },
          null, // pageParam
          false, // filtersBase
          0,
          searchMethod,
        )
      ).aggregations;
    },
    {
      initialData: initialFiltersBase,
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    },
  );

  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseQuery.data,
    aggregations,
  );
  const getTotal = useGetTotal(aggregations);
  const loadGeoData = useLoadGeoData(
    null,
    res,
    () => form.getSubmittedValues(),
    { searchMethod },
  );

  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getForm: () => form,
    setAggregations,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      const widgetsOnPage = extractWidgetsFromDom();
      const filtersOnPage = extractFiltersFromDom();

      const newFilters = filtersOnPage.map((nextFilter) => {
        const completedNext = withDefaultFilterConfig(
          nextFilter,
          intl,
          filtersOptions,
        );
        const found = filters.find(
          (v) =>
            JSON.stringify(omit(v, 'elemRef'))
            === JSON.stringify(omit(completedNext, 'elemRef')),
        );

        // Conserve if found & elem has not changed
        return found && document.body.contains(found.elem)
          ? found
          : completedNext;
      });

      const newWidgets = widgetsOnPage.map((nextWidget) => {
        const found = widgets.find(
          (v) =>
            JSON.stringify(omit(v, 'elemRef'))
            === JSON.stringify(omit(nextWidget, 'elemRef')),
        );

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

        setAggregations(result.aggregations || {});
        setTotal(result.total || 0);
      });

      const mapFilter = filters.find((v) => v.type === 'map');
      const mapElem = mapFilter?.elemRef?.current;
      const viewport = result.aggregations?.viewport;

      if (mapElem && viewport) {
        mapElem.onQueryChange(viewport);
      }
    },
    updateLocation: (values) => {
      const queryStr = qs.stringify(values, {
        addQueryPrefix: true,
        skipNulls: true,
      });

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

      onLoad(initialQuery, aggs, form);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const widgetElems = widgets.map((widget) => {
    switch (widget.name) {
      case 'total':
        return (
          <Portal key={widgetSeed(widget)} selector={widget.destSelector}>
            <span>
              <Total total={total} {...widget} />
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
              <FavoriteToggle
                agendaUid={agendaUid}
                widget={widget}
                {...widget}
              />
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
        agendaUid={agendaUid}
        missingValue={filtersOptions.missingValue}
        // filters
        choiceComponent={choiceComponent}
        dateRangeComponent={dateRangeComponent}
        simpleDateRangeComponent={simpleDateRangeComponent}
        definedRangeComponent={definedRangeComponent}
        numberRangeComponent={numberRangeComponent}
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
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FiltersManager ref={ref} {...props} />
    </QueryClientProvider>
  );
});

export default Wrapper;
