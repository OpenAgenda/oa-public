/* global __DEVELOPMENT__ */

import React, { useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from '@openagenda/react-components/build/Image';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import useApiClient from '@openagenda/react-utils/dist/useApiClient';
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
  geoFiltersSummary: {
    id: 'aggregator-sources.SourcesList.geoFiltersSummary',
    defaultMessage:
      '{geoCount, plural, =0 {0 geographical filter} =1 {1 geographical filter} other {# geographical filters}}'
  },
  labelFiltersSummary: {
    id: 'aggregator-sources.SourcesList.labelFiltersSummary',
    defaultMessage:
      '{labelCount, plural, =0 {0 label filter} =1 {1 label filter} other {# label filters}}'
  },
  extendedFiltersSummary: {
    id: 'aggregator-sources.SourcesList.extendedFiltersSummary',
    defaultMessage:
      '{extendedCount, plural, =0 {0 extended filter} =1 {1 extended filter} other {# extended filters}}'
  },
  noFilter: {
    id: 'aggregator-sources.SourcesList.noFilter',
    defaultMessage: 'No filter'
  },
  actionsSummary: {
    id: 'aggregator-sources.SourcesList.actionsSummary',
    defaultMessage:
      '{actionCount, plural, =1 {1 action} other {# actions}} on {actionFields}'
  },
  noAction: {
    id: 'aggregator-sources.SourcesList.noAction',
    defaultMessage: 'No action'
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

function RulesSummary({ rules, schema }) {
  const intl = useIntl();

  const info = useMemo(() => {
    const result = (rules || []).reduce(
      (accu, rule) => {
        const values = ruleToValues(rule, schema, null, intl);

        if (values.type === 'location') {
          accu.geoCount += 1;
        }

        if (values.type === 'tags') {
          accu.labelCount += 1;
        }

        if (values.type === 'extended') {
          accu.extendedCount += 1;
        }

        if (values.actions.length) {
          accu.actionCount += values.actions.length;

          Array.prototype.push.apply(accu.actionFields, values.actions);
        }

        return accu;
      },
      {
        geoCount: 0,
        labelCount: 0,
        extendedCount: 0,
        actionCount: 0,
        actionFields: []
      }
    );

    result.actionList = [
      ...new Map(
        result.actionFields.map(item => [
          item.field.value,
          <em key={item.field.value}>{item.field.label}</em>
        ])
      ).values()
    ];

    return result;
  }, [intl, rules, schema]);

  const hasFilter = info.geoCount + info.labelCount + info.extendedCount !== 0;

  const rulesJSON = useMemo(() => JSON.stringify(rules, null, 2), [rules]);

  return (
    <p className="rules-summary">
      {hasFilter
        ? intl.formatList(
          [
            info.geoCount
                && intl.formatMessage(messages.geoFiltersSummary, info),
            info.labelCount
                && intl.formatMessage(messages.labelFiltersSummary, info),
            info.extendedCount
                && intl.formatMessage(messages.extendedFiltersSummary, info)
          ].filter(Boolean)
        )
        : intl.formatMessage(messages.noFilter)}

      <br />

      {info.actionCount > 0
        ? intl.formatMessage(messages.actionsSummary, {
          ...info,
          actionFields: intl.formatList(info.actionList)
        })
        : intl.formatMessage(messages.noAction)}

      {hasFilter ? (
        <MoreInfo
          id="fourth-popover"
          content={intl.formatMessage(messages.copy)}
        >
          <CopyToClipboard text={rulesJSON}>
            <button type="button" className="btn btn-link-inline rules-copy">
              <i className="fa fa-sm fa-clipboard" aria-hidden="true" />
            </button>
          </CopyToClipboard>
        </MoreInfo>
      ) : null}
    </p>
  );
}

function SourceItem({ source, aggregatorSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector(state => state.res);

  const showModalRemove = useCallback(
    () => dispatch(modalsActions.showModal('removeSource', { source })),
    [dispatch, source]
  );
  const showModalUpdate = useCallback(async () => {
    const schema = await apiClient.get(
      `/${source.agenda.slug}/settings/schema`
    );

    dispatch(modalsActions.showModal('updateSource', { source, schema }));
  }, [apiClient, dispatch, source]);

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

        <RulesSummary rules={source.rules} schema={aggregatorSchema} />

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

export default function SourcesList({ sources, aggregatorSchema }) {
  const renderSource = useCallback(
    source => (
      <SourceItem
        key={source.id}
        source={source}
        aggregatorSchema={aggregatorSchema}
      />
    ),
    [aggregatorSchema]
  );

  if (!sources || !sources.length) {
    return null;
  }

  return sources.map(renderSource);
}
