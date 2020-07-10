import _ from 'lodash';
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import getLocaleValue from '../utils/getLocaleValue';
import titleMessages from '../titleMessages';

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

export function getChartTitle(stat, intl) {
  const messageKey = statToTitleMessageKey(stat.aggregation);

  if (stat.state.fieldSchema) {
    return getLocaleValue(stat.state.fieldSchema.label, intl.locale);
  }

  if (titleMessages[messageKey]) {
    return intl.formatMessage(titleMessages[messageKey]);
  }

  return messageKey;
}

export default function useChartTitle(stat) {
  const intl = useIntl();

  return useMemo(() => {
    const messageKey = statToTitleMessageKey(stat.aggregation);
    let result;

    if (stat.state.fieldSchema) {
      result = getLocaleValue(stat.state.fieldSchema.label, intl.locale);
    } else if (titleMessages[messageKey]) {
      result = intl.formatMessage(titleMessages[messageKey]);
    } else {
      result = messageKey;
    }

    return result;
  }, [intl, stat.aggregation, stat.state.fieldSchema]);
}
