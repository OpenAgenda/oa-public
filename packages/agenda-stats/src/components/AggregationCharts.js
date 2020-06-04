import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as statsActions from '../reducers/stats';
import ComposedChart from './ComposedChart';
import ChartWrapper from './ChartWrapper';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

export default function AggregationCharts({
  agenda,
  stats,
  totalEvents,
  range
}) {
  const dispatch = useDispatch();

  const loadStat = useCallback(
    (statId, getOptions) => dispatch(statsActions.loadStat(agenda, statId, getOptions)),
    [agenda, dispatch]
  );

  const result = [];

  let sepCount = 0;
  let chartsFromLastSep = 0;
  const pushSeparator = () => {
    result.push(<div key={`sep-${sepCount}`} className="clearfix" />);
    sepCount += 1;
    chartsFromLastSep = 0;
  };
  const pushSeparatorIfEven = () => {
    if (chartsFromLastSep > 0 && chartsFromLastSep % 2 === 0) {
      pushSeparator();
    }
  };
  const pushChart = chart => {
    pushSeparatorIfEven();
    result.push(chart);
    chartsFromLastSep += 1;
  };

  stats.forEach(stat => {
    if (stat.separator) {
      pushSeparator();
    }

    if (!stat.chart) {
      return null;
    }

    const multiData = Array.isArray(stat.aggregation);
    const hasData = multiData
      ? stat.data?.some(v => v.length)
      : stat.data?.length;

    if (hasData) {
      pushChart(
        <ComposedChart
          key={stat.id}
          wrapperComponent={ChartWrapper}
          stat={stat}
          totalEvents={totalEvents}
          range={range}
          loadStat={loadStat}
        />
      );
    } else {
      pushChart(
        <ChartWrapper
          key={stat.id}
          stat={stat}
          totalEvents={totalEvents}
          range={range}
          loadStat={loadStat}
        >
          <div className="margin-v-sm text-center text-muted">
            Aucune valeur.
          </div>
        </ChartWrapper>
      );
    }
  });

  return <div className="row">{result}</div>;
}
