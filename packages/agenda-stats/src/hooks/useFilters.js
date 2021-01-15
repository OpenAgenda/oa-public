import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import { dateRanges } from '@openagenda/react-filters';
import stateMessages from '../messages/states';

const AGGREGATION_SIZE = 20000;

const defaultOptions = {
  standards: true,
  additionals: true,
};

export default function useFilters(
  agendaSchema,
  { standards, additionals } = defaultOptions
) {
  const intl = useIntl();
  const seed = useUIDSeed();

  const stateOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(stateMessages.refused),
        value: -1,
      },
      {
        label: intl.formatMessage(stateMessages.tocontrol),
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

    const standardFilters = standards
      ? [
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
            size: AGGREGATION_SIZE,
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
  }, [additionals, agendaSchema.fields, intl, seed, standards, stateOptions]);
}
