import _ from 'lodash';
import React, { useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
import mergeMultiData from '../utils/mergeMultiData';
import getLocaleValue from '../utils/getLocaleValue';
import HorizontalBarChart from './basics/HorizontalBarChart';
import VerticalBarChart from './basics/VerticalBarChart';
import DateTooltipItem from './basics/DateTooltipItem';
import DateAxisTick from './basics/DateAxisTick';
import DefaultTooltipItem from './basics/DefaultTooltipItem';

const messages = defineMessages({
  tooltipContentEvents: {
    id: 'AgendaStats.ComposedChart.tooltipContentEvents',
    defaultMessage:
      '{value, plural, =0 {# event} one {# event} other {# events}}'
  },
  tooltipContentTimings: {
    id: 'AgendaStats.ComposedChart.tooltipContentTimings',
    defaultMessage:
      '{value, plural, =0 {# timing} one {# timing} other {# timings}}'
  },
  tooltipContentCreatedAt: {
    id: 'AgendaStats.ComposedChart.tooltipContentCreatedAt',
    defaultMessage:
      '{value, plural, =0 {# created event} one {# created event} other {# created events}}'
  },
  tooltipContentUpdatedAt: {
    id: 'AgendaStats.ComposedChart.tooltipContentUpdatedAt',
    defaultMessage:
      '{value, plural, =0 {# updated event} one {# updated event} other {# updated events}}'
  }
});

function ComposedChart({
  wrapperComponent,
  stat,
  totalEvents,
  range,
  loadStat
}) {
  const { aggregation, chart, data: rawData } = stat;
  const {
    type,
    tooltip: tooltipType,
    xAxisTick: xAxisTickType,
    fromDataKey,
    dataKey,
    labelKey
  } = chart;
  const intl = useIntl();
  const data = useMemo(() => {
    let result = rawData;

    if (fromDataKey?.length) {
      result = mergeMultiData(rawData, fromDataKey, dataKey);
    }

    [].concat(labelKey).forEach(k => {
      result = result.map(v => ({
        ...v,
        ..._.set({}, k, getLocaleValue(_.get(v, k), intl.locale))
      }));
    });

    return result;
  }, [rawData, fromDataKey, dataKey, labelKey, intl.locale]);

  const ChartComponent = useMemo(() => {
    if (type === 'horizontal') {
      return HorizontalBarChart;
    }

    if (type === 'vertical') {
      return VerticalBarChart;
    }
  }, [type]);

  const renderTooltipItem = useCallback(
    props => {
      const agg = Array.isArray(aggregation)
        ? aggregation[props.index]
        : aggregation;

      const hideLabel = Array.isArray(aggregation)
        && props.index > 0
        && getValueByDataKey(
          props.array[props.index].payload,
          props.array[props.index].datakey
        )
          === getValueByDataKey(
            props.array[props.index - 1].payload,
            props.array[props.index - 1].datakey
          );

      let tooltipContentMessage;

      switch (agg.type) {
        case 'timings':
          tooltipContentMessage = messages.tooltipContentTimings;
          break;
        case 'createdAt':
          tooltipContentMessage = messages.tooltipContentCreatedAt;
          break;
        case 'updatedAt':
          tooltipContentMessage = messages.tooltipContentUpdatedAt;
          break;
        default:
          tooltipContentMessage = messages.tooltipContentEvents;
          break;
      }

      if (tooltipType === 'date') {
        return (
          <DateTooltipItem
            interval={aggregation.interval}
            message={tooltipContentMessage}
            hideLabel={hideLabel}
            {...props}
          />
        );
      }

      return <DefaultTooltipItem hideLabel={hideLabel} {...props} />;
    },
    [aggregation, tooltipType]
  );

  const xAxisTick = useMemo(() => {
    if (xAxisTickType === 'date') {
      return <DateAxisTick interval={aggregation.interval} />;
    }
  }, [aggregation.interval, xAxisTickType]);

  if (!ChartComponent) {
    return null;
  }

  const child = (
    <ChartComponent
      data={data}
      totalEvents={totalEvents}
      dataKey={dataKey}
      labelKey={labelKey}
      renderTooltipItem={renderTooltipItem}
      xAxisTick={xAxisTick}
    />
  );

  const wrapper = wrapperComponent || React.Fragment;
  const wrapperProps = wrapperComponent
    ? {
      stat,
      totalEvents,
      range,
      loadStat
    }
    : null;

  return React.isValidElement(wrapper)
    ? React.cloneElement(wrapper, wrapperProps, child)
    : React.createElement(wrapper, wrapperProps, child);
}

export default ComposedChart;
