import { useMemo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import CopyToClipboardModule from 'react-copy-to-clipboard';
import { useApiClient, MoreInfo, Image } from '@openagenda/react-shared';
import * as modalsActions from '../reducers/modals.js';

const { CopyToClipboard } = CopyToClipboardModule;

const isDev = process.env.NODE_ENV === 'development';

const messages = defineMessages({
  officialAgenda: {
    id: 'aggregator-sources.SourcesList.officialAgenda',
    defaultMessage: 'Official agenda',
  },
  update: {
    id: 'aggregator-sources.SourcesList.update',
    defaultMessage: 'Update',
  },
  remove: {
    id: 'aggregator-sources.SourcesList.remove',
    defaultMessage: 'Remove',
  },
  seeAgenda: {
    id: 'aggregator-sources.SourcesList.seeAgenda',
    defaultMessage: 'See agenda',
  },
  copy: {
    id: 'aggregator-sources.SourcesList.copy',
    defaultMessage: 'Copy',
  },
});

function SourceItem({ source }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector((state) => state.res);

  const rulesJSON = useMemo(
    () => JSON.stringify(source.rules, null, 2),
    [source.rules],
  );

  const showModalRemove = useCallback(
    () => dispatch(modalsActions.showModal('removeSource', { source })),
    [dispatch, source],
  );
  const showModalUpdate = useCallback(async () => {
    const schema = await apiClient
      .get(`/${source.agenda.slug}/settings/schema`)
      .json();

    dispatch(modalsActions.showModal('updateSource', { source, schema }));
  }, [apiClient, dispatch, source]);

  return (
    <div className="padding-v-sm">
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
                isDev ? source.agenda.image.replace('dev', 'main') : null
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
              <strong>
                {source.agenda.title}
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
              </strong>
            </button>
          </div>

          <div className="actions">
            <button
              type="button"
              onClick={showModalUpdate}
              className="btn btn-link-inline"
            >
              {intl.formatMessage(messages.update, {
                rulesCount: source.rules.length,
              })}
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
            <MoreInfo content={intl.formatMessage(messages.copy)}>
              <CopyToClipboard text={rulesJSON}>
                <button
                  type="button"
                  className="btn btn-link-inline rules-copy"
                  aria-label={intl.formatMessage(messages.copy)}
                >
                  <i className="fa fa-sm fa-clipboard" aria-hidden="true" />
                </button>
              </CopyToClipboard>
            </MoreInfo>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SourcesList({ sources, aggregatorAgendaSchema }) {
  const renderSource = useCallback(
    (source) => (
      <SourceItem
        key={source.id}
        source={source}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
      />
    ),
    [aggregatorAgendaSchema],
  );

  if (!sources || !sources.length) {
    return null;
  }

  return sources.map(renderSource);
}
