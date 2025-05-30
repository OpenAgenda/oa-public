import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import base64 from 'base-64';
import utf8 from 'utf8';

import { Modal } from '@openagenda/react-shared';
import AgendaSearchInput from './AgendaSearchInput.js';

const AggregatorModal = ({ targetAgenda, onClose, res, userLogged, root }) => {
  const [noAgendas, setNoAgendas] = useState(false);

  const intl = useIntl();

  const messages = defineMessages({
    aggregatorTitle: {
      id: 'aggregator-title',
      defaultMessage: 'Aggregate to an agenda',
    },
    aggregatorDescription: {
      id: 'aggregator-description',
      defaultMessage:
        'Events published by {targetAgenda} will be automatically added to the selected calendar.',
    },
    noAgenda: {
      id: 'no-agenda',
      defaultMessage:
        "Warning: No agenda is administered by your account. Please create one first if you wish to aggregate {targetAgenda}'s events.",
    },
    createAgenda: {
      id: 'create-agenda',
      defaultMessage: 'Create an agenda',
    },
    signIn: {
      id: 'sign-in-agg',
      defaultMessage:
        'You need to sign in to your account to aggregate this event.',
    },
    connectionBtn: {
      id: 'connection-btn',
      defaultMessage: 'Sign In',
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    return onClose();
  };

  const encodeUrl = () => {
    const url = `${root}/${targetAgenda.slug}?displayAggregatorModal=1`;
    const bytes = utf8.encode(url);
    return base64.encode(bytes);
  };

  const getTitleLink = (agenda) =>
    `/${agenda.slug}/admin/sources?source=${targetAgenda.slug}&redirect=/${targetAgenda.slug}`;

  return (
    <div id="event">
      <Modal
        classNames={{ overlay: 'popup-overlay big' }}
        disableBodyScroll
        onClose={onClose}
      >
        <div className="export-form" onSubmit={handleSubmit}>
          <button
            className="close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fa fa-times fa-lg" />
          </button>
          <h2 className="export-title">
            {intl.formatMessage(messages.aggregatorTitle)}
          </h2>
          <div className="padding-right-sm">
            <p className="text-muted">
              {intl.formatMessage(messages.aggregatorDescription, {
                targetAgenda: targetAgenda.title,
              })}
            </p>
            <div className="search margin-top-md margin-bottom-sm">
              {!userLogged && (
                <>
                  <p>{intl.formatMessage(messages.signIn)}</p>
                  <a
                    className="btn btn-primary export-button"
                    href={`${root}/${targetAgenda.slug}/signin?redirect=${encodeUrl()}`}
                  >
                    {intl.formatMessage(messages.connectionBtn)}
                  </a>
                </>
              )}
              {userLogged && noAgendas && (
                <>
                  <p>
                    {intl.formatMessage(messages.noAgenda, {
                      targetAgenda: targetAgenda.title,
                    })}
                  </p>
                  <a className="btn btn-primary" href="/agendas/new">
                    {intl.formatMessage(messages.createAgenda)}
                  </a>
                </>
              )}
              {userLogged && (
                <AgendaSearchInput
                  filter={{ role: 'administrator' }}
                  getTitleLink={(agenda) => getTitleLink(agenda)}
                  res={res}
                  targetAgenda={targetAgenda}
                  preFetchAgendas
                  noAgendas={(bool) => setNoAgendas(bool)}
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AggregatorModal;
