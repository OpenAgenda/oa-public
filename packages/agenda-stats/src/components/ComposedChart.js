import React, { useMemo, useCallback } from 'react';
import { defineMessages } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
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

export default function ComposedChart({
  wrapperComponent,
  stat,
  totalEvents,
  range,
  loadStat
}) {
  const { aggregation, chart, data } = stat;
  const {
    orientation, // TODO replace with `type` ?
    tooltip: tooltipType,
    xAxisTick: xAxisTickType,
    loadMore: _withLoadMore,
    intervalSelector: _withIntervalSelector,
    ...chartOpts
  } = chart;

  const ChartComponent = useMemo(() => {
    if (orientation === 'horizontal') {
      return HorizontalBarChart;
    }

    if (orientation === 'vertical') {
      return VerticalBarChart;
    }
  }, [orientation]);

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
            // interval={diplayedInterval}
            interval="month"
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
      return (
        <DateAxisTick
          // interval={diplayedInterval}
          interval="month"
        />
      );
    }
  }, [xAxisTickType]);

  if (!ChartComponent) {
    return null;
  }

  const child = (
    <ChartComponent
      {...chartOpts}
      data={data}
      totalEvents={totalEvents}
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
