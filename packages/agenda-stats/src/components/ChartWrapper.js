import React, { useCallback, useState } from 'react';
import { useUpdateEffect, usePrevious } from 'react-use';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import useChartTitle from '../hooks/useChartTitle';
import * as statsActions from '../reducers/stats';
import LoadMore from './LoadMore';
import BorderBox from './BorderBox';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

const messages = defineMessages({
  remove: {
    id: 'AgendaStats.ChartWrapper.remove',
    defaultMessage: 'Remove'
  },
  update: {
    id: 'AgendaStats.ChartWrapper.update',
    defaultMessage: 'Update'
  }
});

function ContentWrapper({ editMode, children }) {
  if (!editMode) {
    return children;
  }

  return (
    <BorderBox className="padding-h-sm padding-bottom-sm">{children}</BorderBox>
  );
}

function ChartWrapper(
  {
    stat, totalEvents, loadStat, editMode, className, children
  },
  ref
) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [interval, setInterval] = useState(stat.aggregation.interval);
  const previousInterval = usePrevious(interval);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(
    () => loadStat(stat.id, (options, actualData) => ({
      ...options,
      size: (actualData.length || 0) + 5
    })),
    [loadStat, stat.id]
  );

  const titleMessage = useChartTitle({
    stat,
    interval,
    setInterval,
    loading
  });

  const removeStat = useCallback(
    () => dispatch(statsActions.removeStat(stat.id)),
    [dispatch, stat.id]
  );
  // const updateStat = useCallback(
  //   () => {
  //     // open modal with select for move
  //   },
  //   []
  // );

  // Reload the graph with changed `interval` option
  useUpdateEffect(() => {
    if (interval === previousInterval) {
      return;
    }

    setLoading(true);
    loadStat(stat.id, previousOptions => ({
      ...previousOptions,
      interval
    })).finally(() => setLoading(false));
  }, [interval, loadStat, previousInterval, stat.id]);

  return (
    <div className={className} ref={ref}>
      <ContentWrapper editMode={editMode}>
        {editMode ? (
          <div className="text-right margin-top-xs">
            {/* <button
              type="button"
              className="btn btn-link btn-link-inline"
              onClick={updateStat}
            >
              {intl.formatMessage(messages.update)}
            </button> */}
            <button
              type="button"
              className="btn btn-link btn-link-inline text-danger margin-left-xs"
              onClick={removeStat}
            >
              {intl.formatMessage(messages.remove)}
            </button>
          </div>
        ) : null}

        <h3 className="text-center">{titleMessage}</h3>

        {children}

        {stat.chart.loadMore ? (
          <LoadMore stat={stat} total={totalEvents} loadMore={loadMore} />
        ) : null}
      </ContentWrapper>
    </div>
  );
}

export default React.forwardRef(ChartWrapper);
