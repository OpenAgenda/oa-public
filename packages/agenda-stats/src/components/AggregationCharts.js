import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as statsActions from '../reducers/stats';
import ComposedChart from './ComposedChart';
import ChartWrapper from './ChartWrapper';
import Separator from './Separator';
import ChartAdder from './ChartAdder';

// import OriginAgendasPieChart from './OriginAgendasPieChart';

const LAYOUT_WIDTH = 2;

export default function AggregationCharts({
  agenda,
  stats,
  totalEvents,
  range,
  editMode,
  agendaSchema
}) {
  const dispatch = useDispatch();

  const loadStat = useCallback(
    (statId, getOptions) => dispatch(statsActions.loadStat(agenda, statId, getOptions)),
    [agenda, dispatch]
  );

  const result = [];

  let sepCount = 0;
  let chartsFromLastSep = 0;
  const pushSeparator = stat => {
    result.push(
      <Separator key={`sep-${sepCount}`} stat={stat} editMode={editMode} />
    );
    sepCount += 1;
    chartsFromLastSep = 0;
  };
  const pushSeparatorIfNeeded = width => {
    if (chartsFromLastSep === 0) {
      return;
    }

    if (
      chartsFromLastSep % LAYOUT_WIDTH === 0
      || chartsFromLastSep + width > LAYOUT_WIDTH
    ) {
      pushSeparator();
    }
  };
  const pushChart = (chart, width) => {
    pushSeparatorIfNeeded(width);
    result.push(chart);
    chartsFromLastSep += width;
  };

  stats.forEach(stat => {
    if (stat.separator) {
      pushSeparator(stat);
    }

    if (!stat.chart) {
      return null;
    }

    const chartWidth = stat.chart.width || 1;
    const chartCol = Math.min((12 / LAYOUT_WIDTH) * chartWidth, 12);

    pushChart(
      <ComposedChart
        key={stat.id}
        wrapperComponent={(
          <ChartWrapper
            key={stat.id}
            editMode={editMode}
            className={`col-md-12 col-lg-${chartCol} margin-top-md`}
          />
        )}
        stat={stat}
        totalEvents={totalEvents}
        range={range}
        loadStat={loadStat}
      />,
      chartWidth
    );
  });

  if (editMode) {
    pushChart(
      <ChartAdder
        key="chart-adder"
        agenda={agenda}
        agendaSchema={agendaSchema}
        stats={stats}
      />,
      1
    );
  }

  return <div className="row">{result}</div>;
}
