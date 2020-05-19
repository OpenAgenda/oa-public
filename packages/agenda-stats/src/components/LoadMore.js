import _ from 'lodash';
import React, {
  useState, useMemo, useCallback, useLayoutEffect
} from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-components';

const messages = defineMessages({
  loadMore: {
    id: 'AgendaStats.LoadMore.loadMore',
    defaultMessage: 'Load more'
  },
  nothingMore: {
    id: 'AgendaStats.LoadMore.nothingMore',
    defaultMessage: 'There is nothing more'
  }
});

export default function LoadMore({
  data,
  total,
  dataKey,
  aggregationKey,
  loadMore
}) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClick = useCallback(() => {
    setLoading(true);
    loadMore(aggregationKey)
      .then(result => {
        const aggData = result.data.aggregations[aggregationKey];

        if (aggData.length === data.length) {
          setNoMore(true);
        }
      })
      .finally(() => setLoading(false));
  }, [aggregationKey, data.length, loadMore]);

  const hasMore = useMemo(
    () => total !== data.reduce((accu, next) => accu + _.get(next, dataKey), 0),
    [total, data, dataKey]
  );

  // Reset `hasMore` if data changes
  useLayoutEffect(() => {
    if (hasMore) {
      setNoMore(false);
    }
  }, [data, hasMore]);

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
