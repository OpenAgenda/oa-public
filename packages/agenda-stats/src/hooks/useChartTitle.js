import _ from 'lodash';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { getLocaleValue } from '@openagenda/intl';
import titleMessages from '../messages/chartTitles';

function statToTitleMessageKey(aggregation) {
  let messageKey = '';

  if (Array.isArray(aggregation)) {
    for (const agg of aggregation) {
      messageKey += messageKey === '' ? agg.type : _.upperFirst(agg.type);
    }
  } else {
    messageKey += aggregation.type;
  }

  return messageKey;
}

export function getChartTitle(aggregation, fieldSchema, intl) {
  const messageKey = statToTitleMessageKey(aggregation);

  if (fieldSchema) {
    return getLocaleValue(fieldSchema.label, intl.locale);
  }

  if (titleMessages[messageKey]) {
    return intl.formatMessage(titleMessages[messageKey]);
  }

  return messageKey;
}

export default function useChartTitle(stat) {
  const intl = useIntl();

  return useMemo(
    () => getChartTitle(stat.aggregation, stat.state.fieldSchema, intl),
    [intl, stat.aggregation, stat.state.fieldSchema]
  );
}
