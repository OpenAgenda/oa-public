/* global __DEVELOPMENT__ */

import React, { useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from '@openagenda/react-components/build/Image';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import * as modalsActions from '../reducers/modals';
import { ruleToValues } from '../utils/rules';

const messages = defineMessages({
  officialAgenda: {
    id: 'aggregator-sources.SourcesList.officialAgenda',
    defaultMessage: 'Official agenda'
  },
  update: {
    id: 'aggregator-sources.SourcesList.update',
    defaultMessage: 'Update'
  },
  remove: {
    id: 'aggregator-sources.SourcesList.remove',
    defaultMessage: 'Remove'
  },
  filtersSummary: {
    id: 'aggregator-sources.SourcesList.filtersSummary',
    defaultMessage:
      '{geoCount, plural, =0 {No geographical filter} =1 {1 geographical filter} other {# geographical filters}} and {labelCount, plural, =0 {no label filter} =1 {1 label filter} other {# label filters}}'
  },
  noFilter: {
    id: 'aggregator-sources.SourcesList.noFilter',
    defaultMessage: 'No filters'
  },
  seeAgenda: {
    id: 'aggregator-sources.SourcesList.seeAgenda',
    defaultMessage: 'See agenda'
  },
  copy: {
    id: 'aggregator-sources.SourcesList.copy',
    defaultMessage: 'Copy'
  }
});

const copyToClipboardOptions = { format: 'application/json' };

function RulesSummary({ rules }) {
  const intl = useIntl();

  const counters = useMemo(
    () => (rules || []).reduce(
      (accu, next) => {
        const values = ruleToValues(next);

        if (values.type === 'location') {
          accu.geoCount += 1;
        }
        if (values.type === 'tags') {
          accu.labelCount += 1;
        }

        return accu;
      },
      { geoCount: 0, labelCount: 0 }
    ),
    [rules]
  );

  const hasFilter = counters.geoCount + counters.labelCount !== 0;

  const rulesJSON = useMemo(() => JSON.stringify(rules, null, 2), [rules]);

  return (
    <p className="filters-summary">
      {hasFilter
        ? intl.formatMessage(messages.filtersSummary, counters)
        : intl.formatMessage(messages.noFilter)}

      {hasFilter ? (
        <MoreInfo
          id="fourth-popover"
          content={intl.formatMessage(messages.copy)}
        >
          <CopyToClipboard text={rulesJSON} options={copyToClipboardOptions}>
            <button type="button" className="btn btn-link-inline filters-copy">
              <i className="fa fa-sm fa-clipboard" aria-hidden="true" />
            </button>
          </CopyToClipboard>
        </MoreInfo>
      ) : null}
    </p>
  );
}

function SourceItem({ source }) {
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
        <button
          type="button"
          className="btn btn-link-inline"
          onClick={showModalUpdate}
        >
          <Image
            className="media-object ill avatar"
            src={source.agenda.image}
            fallbackSrc={
              __DEVELOPMENT__
                ? source.agenda.image.replace('cibuldev', 'cibul')
                : null
            }
            alt={source.agenda.title}
          />
        </button>
      </div>
      <div className="media-body">
        <div className="title media-heading">
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={showModalUpdate}
          >
            <strong>{source.agenda.title}</strong>
          </button>
          {!!source.agenda.official && (
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

        <RulesSummary rules={source.rules} />

        <div className="actions">
          <button
            type="button"
            onClick={showModalUpdate}
            className="btn btn-link-inline"
          >
            {intl.formatMessage(messages.update)}
          </button>{' '}
          <a href={res.showAgenda.replace(':slug', source.agenda.slug)}>
            {intl.formatMessage(messages.seeAgenda)}
          </a>{' '}
          <button
            type="button"
            onClick={showModalRemove}
            className="btn btn-link-inline text-danger"
          >
            {intl.formatMessage(messages.remove)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SourcesList({ sources }) {
  const renderSource = useCallback(
    source => <SourceItem key={source.id} source={source} />,
    []
  );

  if (!sources || !sources.length) {
    return null;
  }

  return sources.map(renderSource);
}
