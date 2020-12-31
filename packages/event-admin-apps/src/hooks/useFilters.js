import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import stateMessages from '../messages/states';
import getLocaleValue from '../utils/getLocaleValue';

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
    const standardFilters = standards
      ? [
        { name: 'timings', type: 'dateRange' },
        { name: 'createdAt', type: 'dateRange' },
        { name: 'updatedAt', type: 'dateRange' },
        {
          name: 'state',
          type: 'radio',
          options: stateOptions,
          aggregation: {
            type: 'states',
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
          label: getLocaleValue(fieldSchema.label, intl.locale),
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
  }, [agendaSchema.fields, intl.locale, stateOptions]);
}
