import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import React, { useCallback } from 'react';
import * as statsActions from '../reducers/stats';
import BorderBox from './BorderBox';

const messages = defineMessages({
  separator: {
    id: 'AgendaStats.Separator.separator',
    defaultMessage: 'Separator',
  },
  remove: {
    id: 'AgendaStats.Separator.remove',
    defaultMessage: 'Remove',
  },
});

export default function Separator({ stat, editMode }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const removeSeparator = useCallback(
    () => dispatch(statsActions.removeStat(stat.id)),
    [dispatch, stat]
  );

  if (!stat || !editMode) {
    return <div className="clearfix" />;
  }

  return (
    <div className="col-md-12 margin-top-md">
      <BorderBox>
        <div className="margin-all-sm">
          <div className="text-right margin-top-xs">
            {/* <button
              type="button"
              className="btn btn-link btn-link-inline"
              onClick={updateSeparator}
            >
              {intl.formatMessage(messages.update)}
            </button> */}
            <button
              type="button"
              className="btn btn-link btn-link-inline text-danger margin-left-xs"
              onClick={removeSeparator}
            >
              {intl.formatMessage(messages.remove)}
            </button>
          </div>
          <div className="text-center">
            <em>{intl.formatMessage(messages.separator)}</em>
          </div>
        </div>
      </BorderBox>
    </div>
  );
}
