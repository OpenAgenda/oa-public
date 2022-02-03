import _ from 'lodash';
import qs from 'qs';
import React, {
  useCallback, useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { useIntl } from 'react-intl';
import { useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useQuery } from 'react-query';
import { Portal } from '@openagenda/react-portal-ssr';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';
import useApiClient from '@openagenda/react-shared/lib/hooks/useApiClient';
import { getEvents } from '../api';
import { withDefaultFilterConfig, filtersToAggregations, getWidgets } from '../utils';
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
    () => rawFilters.map(rawFilter => withDefaultFilterConfig(rawFilter, intl)),
    [rawFilters, intl]
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

  const getOptions = useCallback(
    filter => {
      if (filter.options) return filter.options;

      if (!filtersBaseQuery.data?.[filter.name]) return [];

      const baseAgg = [...filtersBaseQuery.data[filter.name]];

      const aggregation = aggregations[filter.name];

      if (aggregation) {
        aggregation.forEach(entry => {
          const dataKey = 'id' in entry ? 'id' : 'key';
          const found = baseAgg.find(v => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }

      const labelKey = filter.labelKey || 'key';

      return baseAgg.map(entry => {
        const dataKey = 'id' in entry ? 'id' : 'key';

        return {
          ...entry,
          label: getLocaleValue(_.get(entry, labelKey)),
          value: entry[dataKey]
        };
      });
    },
    [aggregations, filtersBaseQuery.data]
  );

  const getTotal = useCallback(
    (filter, option) => {
      const aggregation = aggregations[filter.name];

      if (!aggregation) return null;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = aggregation.find(v => String(v[dataKey]) === String(option[optionKey]));

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

      const result = (await axios.get(res, {
        params,
        paramsSerializer: p => qs.stringify(p, { skipNulls: true })
      })).data;

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
      const widgetsOnPage = getWidgets();

      setWidgets(widgetsOnPage.reduce((accu, next) => {
        const found = _.find(widgets, next);

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
