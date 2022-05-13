import React, { useState, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Spinner } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';

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

export default function LoadMore({ stat }) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const loadMore = useCallback(
    () => dispatch(
      statsActions.updateStat(stat.id, {
        state: {
          itemsDisplayed: stat.state.itemsDisplayed + 5,
        },
      })
    ),
    [dispatch, stat.id, stat.state.itemsDisplayed]
  );

  const handleClick = useCallback(() => {
    setLoading(true);
    loadMore().finally(() => setLoading(false));
  }, [loadMore]);

  if (!stat.state.data || stat.state.itemsDisplayed >= stat.state.data.length) {
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
