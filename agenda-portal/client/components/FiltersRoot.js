const React = require('react');
const { useIntl } = require('react-intl');
const { useForm } = require('react-final-form');
const { Portal } = require('@stefanoruth/react-portal-ssr');
const {
  Filters,
  MultiChoiceFilter,
  DateRangeFilter,
  SearchFilter,
  MapFilter,
  CustomFilter
} = require('@openagenda/react-filters');
const apiClient = require('@openagenda/react-shared/lib/utils/apiClient');
const withDefaultFilterConfig = require('../lib/withDefaultFilterConfig');
const FiltersPreview = require('./FiltersPreview');

const {
  createElement: el,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} = React;

function Input({ input, placeholder }) {
  const form = useForm();

  return el(
    'div',
    { className: 'input-group mb-3' },
    el(
      'input',
      {
        className: 'form-control',
        autoComplete: 'off',
        placeholder,
        ...input
      }
    ),
    el(
      'div',
      {
        className: 'input-group-append'
      },
      el(
        'button',
        {
          type: 'submit',
          className: 'btn btn-outline-secondary',
          onClick: form.submit
        },
        el(
          'i',
          {
            className: 'fa fa-search',
            'aria-hidden': true
          }
        )
      )
    )
  );
}

const searchProps = {
  component: Input
};

const axios = apiClient();

// geo
// locationUid
// featured
// relative
// attendanceMode
// region
// department
// city

module.exports = React.forwardRef(function FiltersRoot({
  filters: rawFilters,
  activeFiltersSelector,
  initialAggregations = {},
  defaultViewport,
  res,
  initialQuery = {}
}, ref) {
  const intl = useIntl();
  const form = useForm();

  const filters = useMemo(
    () => rawFilters.map(rawFilter => withDefaultFilterConfig(rawFilter, intl)),
    [rawFilters, intl]
  );

  const [query, setQuery] = useState(() => initialQuery);

  const [aggregations, setAggregations] = useState(() => initialAggregations);

  // const filtersQuery = useQuery(
  //   ['agenda-portal', 'filtersBase', agendaUid],
  //   () => getEvents(axios, res, { uid: agendaUid }, filters, { size: 0 }),
  //   {
  //     initialData: filtersBase,
  //     staleTime: 1000,
  //     notifyOnChangeProps: ['data', 'isLoading', 'error'],
  //   }
  // );
  //
  // console.log(filtersQuery);

  // for FiltersProvider
  // Standard filters/fieldSchema/custom ?
  const getOptions = useCallback(
    filter => {
      // console.log('getOptions', filter);
      if (filter.options) return filter.options;

      return [];

      // const aggregation = filterAggs[filter.name];

      // if (!aggregation) return [];
      //
      // const labelKey = filter.labelKey || 'key';
      //
      // return aggregation.map(v => ({
      //   label: _.get(v, labelKey),
      //   value: v.key,
      // }));
    },
    [/* filterAggs */]
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
    [query, res]
  );

  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getQuery: () => query,
    getForm: () => form,
    setAggregations,
    setQuery
  }));

  const activeFilters = activeFiltersSelector
    ? el(
      Portal,
      {
        selector: activeFiltersSelector
      },
      el(
        FiltersPreview,
        {
          filters,
          getOptions
        }
      )
    )
    : null;

  return el(
    React.Fragment,
    null,
    el(
      Filters,
      {
        withRef: true,
        filters,
        dateRangeComponent: DateRangeFilter,
        checkboxComponent: MultiChoiceFilter,
        radioComponent: MultiChoiceFilter,
        mapComponent: MapFilter,
        searchComponent: SearchFilter,
        customComponent: CustomFilter,
        searchProps,
        getOptions,
        getTotal,
        initialViewport: initialAggregations.viewport,
        defaultViewport,
        loadGeoData,
        query
      }
    ),
    activeFilters,
  );
});
