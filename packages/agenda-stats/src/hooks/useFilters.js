import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import stateMessages from '../messages/states';
import getLocaleValue from '../utils/getLocaleValue';

export default function useFilters(agendaSchema) {
  const intl = useIntl();
  const seed = useUIDSeed();

  const stateOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(stateMessages.refused),
        value: -1
      },
      {
        label: intl.formatMessage(stateMessages.tocontrol),
        value: 0
      },
      {
        label: intl.formatMessage(stateMessages.controlled),
        value: 1
      },
      {
        label: intl.formatMessage(stateMessages.published),
        value: 2
      }
    ],
    [intl]
  );

  return useMemo(() => {
    const basicFilters = [
      { name: 'timings', type: 'dateRange' },
      { name: 'createdAt', type: 'dateRange' },
      { name: 'updatedAt', type: 'dateRange' },
      {
        name: 'state',
        type: 'radio',
        options: stateOptions,
        aggregation: {
          type: 'states'
        }
      }
    ];

    const additionalFieldFilters = agendaSchema.fields
      .filter(
        fieldSchema => fieldSchema.options && fieldSchema.options.length > 0
      )
      .map(fieldSchema => ({
        name: fieldSchema.field,
        type: fieldSchema.fieldType,
        label: getLocaleValue(fieldSchema.label, intl.locale),
        options: fieldSchema.options.map(option => ({
          ...option,
          value: option.id
        })),
        aggregation: {
          type: 'additionalFields',
          field: fieldSchema.field
        }
      }));

    return basicFilters.concat(additionalFieldFilters).map(v => ({
      ...v,
      id: seed(v)
    }));
  }, [agendaSchema.fields, intl.locale, stateOptions]);
}
