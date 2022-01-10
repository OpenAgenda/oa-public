import { createRef, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import { useSelector } from 'react-redux';
import { dateRanges } from '@openagenda/react-filters';
import { getLocaleValue } from '@openagenda/react-shared';
import stateMessages from '../messages/states';
import attendanceModeMessages from '../messages/attendanceModes';
import relativeMessages from '../messages/relative';

const AGGREGATION_SIZE = 2000;

const messages = defineMessages({
  featured: {
    id: 'EventAdminApp.hooks.useFilters.featured',
    defaultMessage: 'Featured',
  },
  contribution: {
    id: 'EventAdminApp.hooks.useFilters.contribution',
    defaultMessage: 'Contribution',
  },
  aggregation: {
    id: 'EventAdminApp.hooks.useFilters.aggregation',
    defaultMessage: 'Aggregation',
  },
  share: {
    id: 'EventAdminApp.hooks.useFilters.share',
    defaultMessage: 'Share',
  },
});

export default function useFilters(agendaSchema) {
  const intl = useIntl();
  const seed = useUIDSeed();

  const mapTiles = useSelector(state => state.settings.mapTiles);

  const relativeOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(relativeMessages.passed),
        value: 'passed',
      },
      {
        label: intl.formatMessage(relativeMessages.current),
        value: 'current',
      },
      {
        label: intl.formatMessage(relativeMessages.upcoming),
        value: 'upcoming',
      },
    ],
    [intl]
  );

  const featuredOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.featured),
        value: true,
      },
    ],
    [intl]
  );

  const provenanceOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.contribution),
        value: 'contribution',
      },
      {
        label: intl.formatMessage(messages.aggregation),
        value: 'aggregation',
      },
      {
        label: intl.formatMessage(messages.share),
        value: 'share',
      },
    ],
    [intl]
  );

  const stateOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(stateMessages.refused),
        value: -1,
      },
      {
        label: intl.formatMessage(stateMessages.toModerate),
        value: 0,
      },
      {
        label: intl.formatMessage(stateMessages.controlled),
        value: 1,
      },
      {
        label: intl.formatMessage(stateMessages.published),
        value: 2,
      },
    ],
    [intl]
  );

  const attendanceModeOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(attendanceModeMessages.offline),
        value: 1,
      },
      {
        label: intl.formatMessage(attendanceModeMessages.online),
        value: 2,
      },
      {
        label: intl.formatMessage(attendanceModeMessages.mixed),
        value: 3,
      },
    ],
    [intl]
  );

  return useMemo(() => {
    const { staticRanges, inputRanges } = dateRanges(intl);

    const standardFilters = [
      {
        name: 'viewport',
        type: 'none',
      },
      {
        name: 'geo',
        type: 'map',
        aggregation: null,
        // props for MapFilter
        tileAttribution:
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: mapTiles,
      },
      {
        name: 'addMethod',
        type: 'choice',
        options: provenanceOptions,
        aggregation: {
          type: 'addMethods',
        },
      },
      {
        name: 'memberUid',
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'member.name',
        aggregation: {
          type: 'members',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'locationUid',
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'location.name',
        aggregation: {
          type: 'locations',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'sourceAgendaUid',
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'sourceAgendas',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'originAgendaUid',
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'originAgendas',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'featured',
        type: 'choice',
        options: featuredOptions,
        aggregation: null,
      },
      {
        name: 'relative',
        type: 'choice',
        options: relativeOptions,
        // aggregation: {
        //   type: 'relative',
        // },
      },
      {
        name: 'timings',
        type: 'dateRange',
        staticRanges,
        inputRanges,
        aggregation: null,
      },
      {
        name: 'createdAt',
        type: 'dateRange',
        staticRanges,
        inputRanges,
        aggregation: null,
      },
      {
        name: 'updatedAt',
        type: 'dateRange',
        staticRanges,
        inputRanges,
        aggregation: null,
      },
      {
        name: 'state',
        type: 'choice',
        options: stateOptions,
        aggregation: {
          type: 'states',
        },
      },
      {
        name: 'attendanceMode',
        type: 'choice',
        options: attendanceModeOptions,
        aggregation: {
          type: 'attendanceModes',
        },
      },
      {
        name: 'region',
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'regions',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'department',
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'departments',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'city',
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'cities',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'adminLevel3',
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'adminLevels3',
          size: AGGREGATION_SIZE,
        },
      },
      {
        name: 'keyword',
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'keywords',
          size: AGGREGATION_SIZE,
        },
      },
    ];

    const additionalFilters = agendaSchema.fields
      .filter(
        fieldSchema => fieldSchema.options && fieldSchema.options.length > 0
      )
      .map(fieldSchema => ({
        name: fieldSchema.field,
        type: 'choice',
        fieldSchema,
        options: fieldSchema.options.map(option => ({
          ...option,
          label: getLocaleValue(option.label, intl.locale),
          value: option.id,
        })),
        aggregation: {
          type: 'additionalFields',
          field: fieldSchema.field,
          size: AGGREGATION_SIZE,
        },
      }));

    return standardFilters.concat(additionalFilters).map(v => ({
      ...v,
      id: seed(v),
      elemRef: createRef(),
    }));
  }, [
    intl,
    mapTiles,
    provenanceOptions,
    featuredOptions,
    relativeOptions,
    stateOptions,
    attendanceModeOptions,
    agendaSchema.fields,
    seed,
  ]);
}
