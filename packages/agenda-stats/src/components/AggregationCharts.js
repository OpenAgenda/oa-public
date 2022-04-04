import React, { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import ComposedChart from './ComposedChart';
import ChartWrapper from './ChartWrapper';
import Separator from './Separator';
import ChartAdder from './ChartAdder';
import MetricsChart from './MetricsChart';

// import OriginAgendasPieChart from './OriginAgendasPieChart';

const LAYOUT_WIDTH = 2;

function AggregationCharts() {
  const dispatch = useDispatch();

  const { agenda, agendaSchema } = useLayoutData();

  const stats = useSelector(state => state.stats.data, shallowEqual);
  const query = useSelector(state => state.stats.query);
  const totalEvents = useSelector(state => state.stats.totalEvents);
  const editMode = useSelector(state => state.stats.editing);

  const loadStat = useCallback(
    (statId, getOptions) => dispatch(statsActions.loadStat(agenda, statId, getOptions)),
    [agenda, dispatch]
  );

  if (!stats) {
    return null;
  }

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

    if (stat.chart.type === 'metrics') {
      pushChart(
        <ChartWrapper
          key={stat.id}
          editMode={editMode}
          className={`col-md-12 col-lg-${chartCol} margin-top-md`}
          stat={stat}
          // chartConfig={chartConfig}
          query={query}
          loadStat={loadStat}
        >
          <MetricsChart
            stat={stat}
            totalEvents={totalEvents}
            query={query}
            loadStat={loadStat}
          />
        </ChartWrapper>,
        chartWidth
      );
    } else {
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
          query={query}
          loadStat={loadStat}
        />,
        chartWidth
      );
    }
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

export default React.memo(AggregationCharts);
