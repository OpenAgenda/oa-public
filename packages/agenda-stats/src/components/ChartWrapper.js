import React, { useCallback, useState } from 'react';
import { useUpdateEffect, usePrevious, useLatest } from 'react-use';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useModal, Spinner } from '@openagenda/react-shared';
import useChartTitle from '../hooks/useChartTitle';
import * as statsActions from '../reducers/stats';
import LoadMore from './LoadMore';
import BorderBox from './BorderBox';
import IntervalSelect from './basics/IntervalSelect';
import StatEditModal from './StatEditModal';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

const messages = defineMessages({
  remove: {
    id: 'AgendaStats.ChartWrapper.remove',
    defaultMessage: 'Remove',
  },
  update: {
    id: 'AgendaStats.ChartWrapper.update',
    defaultMessage: 'Update',
  },
  withSelector: {
    id: 'AgendaStats.ChartWrapper.withSelector',
    defaultMessage: '{message} by {selector}',
  },
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
    stat,
    chartConfig = {}, // used for intervalSelector and loadMore
    totalEvents,
    loadStat,
    editMode,
    className,
    children,
  },
  ref
) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [interval, setInterval] = useState(stat.state.interval);
  const latestInterval = useLatest(interval);
  const previousInterval = usePrevious(interval);
  const [loading, setLoading] = useState(false);
  const statEditModal = useModal();

  const loadMore = useCallback(
    () => loadStat(stat.id, prevStat => ({
      ...prevStat,
      state: {
        ...prevStat.state,
        size: (prevStat.state.data?.length || 0) + 5,
      },
    })),
    [loadStat, stat.id]
  );

  const removeStat = useCallback(
    () => dispatch(statsActions.removeStat(stat.id)),
    [dispatch, stat.id]
  );
  const startStatUpdate = useCallback(() => {
    statEditModal.open();
  }, [statEditModal]);
  const updateStat = useCallback(
    values => {
      dispatch(statsActions.updateStat(stat.id, values));
      statEditModal.close();
    },
    [dispatch, stat.id, statEditModal]
  );

  const titleMessage = useChartTitle(stat);

  // Updates interval when state changes (on range change)
  useUpdateEffect(() => {
    if (
      stat.state.interval !== latestInterval.current
      && stat.state.interval !== previousInterval
    ) {
      setInterval(stat.state.interval);
    }
  }, [latestInterval, previousInterval, stat.state.interval]);

  // Reloads the graph when `interval` option changes in the select
  useUpdateEffect(() => {
    if (interval === previousInterval || interval === stat.state.interval) {
      return;
    }

    setLoading(true);
    loadStat(stat.id, prevStat => ({
      ...prevStat,
      state: {
        ...prevStat.state,
        interval,
      },
    })).finally(() => setLoading(false));
  }, [interval, loadStat, previousInterval, stat.id, stat.state.interval]);

  return (
    <div className={className} ref={ref}>
      <ContentWrapper editMode={editMode}>
        {editMode ? (
          <div className="text-right margin-top-xs">
            <button
              type="button"
              className="btn btn-link btn-link-inline"
              onClick={startStatUpdate}
            >
              {intl.formatMessage(messages.update)}
            </button>
            <button
              type="button"
              className="btn btn-link btn-link-inline text-danger margin-left-xs"
              onClick={removeStat}
            >
              {intl.formatMessage(messages.remove)}
            </button>
          </div>
        ) : null}

        <h3 className="text-center">
          {chartConfig.intervalSelector && interval
            ? intl.formatMessage(messages.withSelector, {
              message: titleMessage,
              selector: (
                <>
                  <IntervalSelect value={interval} onChange={setInterval} />

                  {loading ? (
                    <span className="margin-left-xs">
                      <Spinner mode="inline" />
                    </span>
                  ) : null}
                </>
              ),
            })
            : titleMessage}
        </h3>

        {children}

        {chartConfig.loadMore ? (
          <LoadMore stat={stat} total={totalEvents} loadMore={loadMore} />
        ) : null}
      </ContentWrapper>

      {statEditModal.isOpen ? (
        <StatEditModal
          stat={stat}
          onSubmit={updateStat}
          onClose={statEditModal.close}
        />
      ) : null}
    </div>
  );
}

export default React.forwardRef(ChartWrapper);
