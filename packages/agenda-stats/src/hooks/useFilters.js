import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import { dateRanges } from '@openagenda/react-filters';
import { getLocaleValue } from '@openagenda/react-shared';
import stateMessages from '../messages/states';

const AGGREGATION_SIZE = 20000;

export default function useFilters(agendaSchema) {
  const intl = useIntl();
  const seed = useUIDSeed();

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

  return useMemo(() => {
    const { staticRanges, inputRanges } = dateRanges(intl);

    const standardFilters = [
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
        type: 'choice',
        options: stateOptions,
        aggregation: {
          type: 'states',
          size: AGGREGATION_SIZE,
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
    }));
  }, [agendaSchema.fields, intl, seed, stateOptions]);
}
