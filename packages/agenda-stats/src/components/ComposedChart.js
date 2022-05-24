import _ from 'lodash';
import React, { useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
import ContentLoader from 'react-content-loader';
import { getLocaleValue } from '@openagenda/intl';
import mergeMultiData from '../utils/mergeMultiData';
import addRestItem from '../utils/addRestItem';
import { getChartConfig } from '../common/defaultStatConfigs';
import emptyOptionMessage from '../messages/emptyOption';
import HorizontalBarChart from './basics/HorizontalBarChart';
import VerticalBarChart from './basics/VerticalBarChart';
import PieChart from './basics/PieChart';
import DateAxisTick from './basics/DateAxisTick';
import DateTooltipItem from './basics/DateTooltipItem';
import StateTooltipItem from './basics/StateTooltipItem';
import BooleanTooltipItem from './basics/BooleanTooltipItem';
import DefaultTooltipItem from './basics/DefaultTooltipItem';

const messages = defineMessages({
  tooltipContentEvents: {
    id: 'AgendaStats.ComposedChart.tooltipContentEvents',
    defaultMessage:
      '{value, plural, =0 {# event} one {# event} other {# events}}',
  },
  tooltipContentTimings: {
    id: 'AgendaStats.ComposedChart.tooltipContentTimings',
    defaultMessage:
      '{value, plural, =0 {# timing} one {# timing} other {# timings}}',
  },
  tooltipContentCreatedAt: {
    id: 'AgendaStats.ComposedChart.tooltipContentCreatedAt',
    defaultMessage:
      '{value, plural, =0 {# created event} one {# created event} other {# created events}}',
  },
  tooltipContentUpdatedAt: {
    id: 'AgendaStats.ComposedChart.tooltipContentUpdatedAt',
    defaultMessage:
      '{value, plural, =0 {# updated event} one {# updated event} other {# updated events}}',
  },
  noValue: {
    id: 'AgendaStats.ComposedChart.noValue',
    defaultMessage: 'No value.',
  },
});

function sortData(result, dataKey) {
  return result.sort((a, b) => _.get(b, dataKey) - _.get(a, dataKey));
}

function ChartLoading() {
  return (
    <ContentLoader
      speed={2}
      style={{ width: '100%' }}
      height={210}
      viewBox="0 0 400 210"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="20" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="62" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="104" rx="5" ry="5" width="90" height="14" />
      <rect x="0" y="146" rx="5" ry="5" width="90" height="14" />
      <rect x="102" y="10" rx="5" ry="5" width="280" height="32" />
      <rect x="102" y="52" rx="5" ry="5" width="175" height="32" />
      <rect x="102" y="94" rx="5" ry="5" width="100" height="32" />
      <rect x="102" y="136" rx="5" ry="5" width="40" height="32" />
    </ContentLoader>
  );
}

function ComposedChart({
  wrapperComponent,
  stat,
  totalEvents,
  query,
  loadStat,
}) {
  const { aggregation, state } = stat;
  const { data: rawData } = state;
  const intl = useIntl();

  const chartConfig = useMemo(() => getChartConfig(stat), [stat]);
  const {
    type,
    tooltip: tooltipType,
    categoryTick: categoryTickType,
    fromDataKey,
    dataKey,
    labelKey,
    restItem,
    dataColors,
    sort,
  } = chartConfig;

  const data = useMemo(() => {
    if (!rawData) {
      return [];
    }

    const labelKeys = [].concat(labelKey);
    const dataKeys = [].concat(dataKey);
    let result = rawData;

    if (fromDataKey?.length) {
      result = mergeMultiData(rawData, fromDataKey, dataKey);
    }

    if (restItem) {
      dataKeys.forEach((key, index) => {
        result = addRestItem(result, totalEvents, intl, key, labelKeys[index]);
      });
    }

    if (sort) {
      result = sortData(result, dataKeys[0]);
    }

    const withDataColors = typeof dataColors === 'object'
      && dataColors !== null
      && !Array.isArray(dataColors);

    labelKeys.forEach(k => {
      result = result.map(v => {
        const label = _.get(v, k);

        return {
          ...v,
          color: withDataColors ? dataColors[label] : null,
          [k]:
            v.key === 'null'
              ? intl.formatMessage(emptyOptionMessage)
              : getLocaleValue(label, intl.locale),
        };
      });
    });

    return result.slice(0, state.itemsDisplayed);
  }, [
    rawData,
    labelKey,
    fromDataKey,
    restItem,
    dataColors,
    dataKey,
    totalEvents,
    intl,
    state.itemsDisplayed,
  ]);

  const ChartComponent = useMemo(() => {
    if (type === 'horizontal') {
      return HorizontalBarChart;
    }

    if (type === 'vertical') {
      return VerticalBarChart;
    }

    if (type === 'pie') {
      return PieChart;
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
            interval={stat.state.interval}
            message={tooltipContentMessage}
            hideLabel={hideLabel}
            {...props}
          />
        );
      }

      if (tooltipType === 'state') {
        return (
          <StateTooltipItem
            interval={stat.state.interval}
            message={tooltipContentMessage}
            hideLabel={hideLabel}
            {...props}
          />
        );
      }

      if (tooltipType === 'boolean') {
        return (
          <BooleanTooltipItem
            interval={stat.state.interval}
            message={tooltipContentMessage}
            hideLabel={hideLabel}
            {...props}
          />
        );
      }

      return <DefaultTooltipItem hideLabel={hideLabel} {...props} />;
    },
    [aggregation, stat.state.interval, tooltipType]
  );

  const categoryTick = useMemo(() => {
    if (categoryTickType === 'date') {
      return <DateAxisTick interval={stat.state.interval} />;
    }
  }, [stat.state.interval, categoryTickType]);

  if (!ChartComponent) {
    return null;
  }

  let child;

  if (data.length) {
    child = (
      <ChartComponent
        data={data}
        totalEvents={totalEvents}
        dataKey={dataKey}
        labelKey={labelKey}
        renderTooltipItem={renderTooltipItem}
        categoryTick={categoryTick}
        dataColors={dataColors}
      />
    );
  } else if (!stat.state.loaded) {
    child = <ChartLoading />;
  } else {
    child = (
      <div className="margin-v-sm text-center text-muted">
        {intl.formatMessage(messages.noValue)}
      </div>
    );
  }

  const wrapper = wrapperComponent || React.Fragment;
  const wrapperProps = wrapperComponent
    ? {
      stat,
      chartConfig,
      totalEvents,
      query,
      loadStat,
    }
    : null;

  return React.isValidElement(wrapper)
    ? React.cloneElement(wrapper, wrapperProps, child)
    : React.createElement(wrapper, wrapperProps, child);
}

export default ComposedChart;
