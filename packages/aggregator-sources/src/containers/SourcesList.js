/* global __DEVELOPMENT__ */

import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Image from '@openagenda/react-components/build/Image';
import * as modalsActions from '../reducers/modals';

const messages = defineMessages({
  officialAgenda: {
    id: 'aggregator-sources.SourcesList.officialAgenda',
    defaultMessage: 'Official agenda'
  }
});

const SourceItem = function ({ source }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const res = useSelector(state => state.res);

  const showModalRemove = useCallback(
    () => dispatch(modalsActions.showModal('removeSource', { source })),
    [dispatch, source]
  );
  const showModalUpdate = useCallback(
    () => dispatch(modalsActions.showModal('updateSource', { source })),
    [dispatch, source]
  );

  return (
    <div className="agenda-item media">
      <div className="media-left">
        <a href={res.show.replace(':slug', source.slug)}>
          <Image
            className="media-object ill avatar"
            src={source.image}
            fallbackSrc={
              __DEVELOPMENT__ ? source.image.replace('cibuldev', 'cibul') : null
            }
            alt={source.title}
          />
        </a>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <a href={res.show.replace(':slug', source.slug)}>
            <strong>{source.title}</strong>
          </a>
          {!!source.official && (
            <div className="official">
              <i />
              <div className="tooltip right" role="tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">
                  {intl.formatMessage(messages.officialAgenda)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="actions">
          <button
            type="button"
            onClick={showModalRemove}
            className="btn btn-link-inline text-danger"
          >
            Retirer
          </button>{' '}
          <button
            type="button"
            onClick={showModalUpdate}
            className="btn btn-link-inline"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SourcesList({ sources }) {
  const renderSource = useCallback(
    ({ agenda }) => <SourceItem key={agenda.uid} source={agenda} />,
    []
  );

  if (!sources || !sources.length) {
    return null;
  }

  return sources.map(renderSource);
}
