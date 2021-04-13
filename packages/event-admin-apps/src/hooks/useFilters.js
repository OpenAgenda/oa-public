import { useMemo } from 'react';
import { defineMessage, useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import { dateRanges } from '@openagenda/react-filters';
import stateMessages from '../messages/states';
import attendanceModeMessages from '../messages/attendanceModes';
import relativeMessages from '../messages/relative';

const AGGREGATION_SIZE = 20000;

const defaultOptions = {
  standards: true,
  additionals: true,
};

const featuredMessage = defineMessage({
  id: 'EventAdminApp.hooks.useFilters.featured',
  defaultMessage: 'Featured',
});

export default function useFilters(
  agendaSchema,
  { standards, additionals } = defaultOptions
) {
  const intl = useIntl();
  const seed = useUIDSeed();

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
        label: intl.formatMessage(featuredMessage),
        value: true,
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

    const standardFilters = standards
      ? [
        {
          name: 'featured',
          type: 'radio',
          options: featuredOptions,
          aggregation: null,
        },
        {
          name: 'relative',
          type: 'radio',
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
        },
        {
          name: 'createdAt',
          type: 'dateRange',
          staticRanges,
          inputRanges,
        },
        {
          name: 'updatedAt',
          type: 'dateRange',
          staticRanges,
          inputRanges,
        },
        {
          name: 'state',
          type: 'radio',
          options: stateOptions,
          aggregation: {
            type: 'states',
          },
        },
        {
          name: 'attendanceMode',
          type: 'radio',
          options: attendanceModeOptions,
          aggregation: {
            type: 'attendanceModes',
          },
        },
        {
          name: 'region',
          type: 'radio',
          options: null, // from the aggregation
          aggregation: {
            type: 'regions',
            size: AGGREGATION_SIZE,
          },
        },
        {
          name: 'department',
          type: 'radio',
          options: null, // from the aggregation
          aggregation: {
            type: 'departments',
            size: AGGREGATION_SIZE,
          },
        },
        {
          name: 'city',
          type: 'radio',
          options: null, // from the aggregation
          aggregation: {
            type: 'cities',
            size: AGGREGATION_SIZE,
          },
        },
      ]
      : [];

    const additionalFilters = additionals
      ? agendaSchema.fields
        .filter(
          fieldSchema => fieldSchema.options && fieldSchema.options.length > 0
        )
        .map(fieldSchema => ({
          name: fieldSchema.field,
          type: fieldSchema.fieldType,
          fieldSchema,
          options: fieldSchema.options.map(option => ({
            ...option,
            value: option.id,
          })),
          aggregation: {
            type: 'additionalFields',
            field: fieldSchema.field,
            size: AGGREGATION_SIZE,
          },
        }))
      : [];

    return standardFilters.concat(additionalFilters).map(v => ({
      ...v,
      id: seed(v),
    }));
  }, [
    intl,
    standards,
    featuredOptions,
    relativeOptions,
    stateOptions,
    attendanceModeOptions,
    additionals,
    agendaSchema.fields,
    seed,
  ]);
}
