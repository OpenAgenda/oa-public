import _ from 'lodash';
import React, {
  useState, useMemo, useCallback, useLayoutEffect
} from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';

const messages = defineMessages({
  loadMore: {
    id: 'AgendaStats.LoadMore.loadMore',
    defaultMessage: 'Load more',
  },
  nothingMore: {
    id: 'AgendaStats.LoadMore.nothingMore',
    defaultMessage: 'There is nothing more',
  },
});

export default function LoadMore({ stat, total, loadMore }) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClick = useCallback(() => {
    setLoading(true);
    Promise.resolve(loadMore())
      .then(result => {
        const receivedMore = Array.isArray(stat.aggregation)
          ? stat.aggregation.some(
            (v, i) => stat.state.data[i].length
                < result.data.aggregations[`${v.type}-${stat.id}`].length
          )
          : stat.state.data.length
            < result.data.aggregations[`${stat.aggregation.type}-${stat.id}`]
              .length;

        if (!receivedMore) {
          setNoMore(true);
        }
      })
      .finally(() => setLoading(false));
  }, [loadMore, stat.aggregation, stat.state.data, stat.id]);

  const hasMore = useMemo(() => {
    if (!stat.state.data) {
      return false;
    }

    if (Array.isArray(stat.aggregation)) {
      return stat.aggregation.some(
        (v, i) => total
          !== stat.state.data[i].reduce(
            (accu, next) => accu + _.get(next, stat.chart.dataKey[i]),
            0
          )
      );
    }

    return (
      total
      !== stat.state.data.reduce(
        (accu, next) => accu + _.get(next, stat.chart.dataKey),
        0
      )
    );
  }, [stat.aggregation, stat.chart.dataKey, stat.state.data, total]);

  // Reset `hasMore` if data changes
  useLayoutEffect(() => {
    if (hasMore) {
      setNoMore(false);
    }
  }, [stat.state.data, hasMore]);

  useLayoutEffect(() => {
    let id;

    if (noMore) {
      setMessage(intl.formatMessage(messages.nothingMore));
      id = setTimeout(() => {
        setMessage(null);
      }, 1800);
    }

    return () => {
      if (id) {
        clearTimeout(id);
      }
    };
  }, [intl, noMore]);

  if (!hasMore || noMore) {
    if (message) {
      return <div className="text-center text-muted">{message}</div>;
    }

    return null;
  }

  return (
    <div className="text-center">
      <button
        type="button"
        className="btn btn-primary btn-bordered"
        onClick={handleClick}
        disabled={loading}
      >
        {intl.formatMessage(messages.loadMore)}

        {loading ? (
          <span className="margin-left-xs">
            <Spinner mode="inline" />
          </span>
        ) : null}
      </button>
    </div>
  );
}
