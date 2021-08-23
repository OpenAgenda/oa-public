import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import base64 from 'base-64';
import utf8 from 'utf8';

import Modal from '@openagenda/react-shared/src/components/Modal';
import AgendaSearchInput from './AgendaSearchInput';

const AggregatorModal = ({
  targetAgenda, onClose, res, success, userLogged
}) => {
  const [noAgendas, setNoAgendas] = useState(false);

  const intl = useIntl();

  const messages = defineMessages({
    aggregatorTitle: {
      id: 'aggregator-title',
      defaultMessage: 'Aggregate to an agenda',
    },
    aggregatorDescription: {
      id: 'aggregator-description',
      defaultMessage: 'Events published by {targetAgenda} will be automatically added to the selected calendar.',
    },
    aggregatorSuccess: {
      id: 'aggregator-success',
      defaultMessage:
        "{targetAgenda} was successfully added as a source! \n {targetAgenda}'s events are being aggregated.",
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
      defaultMessage: 'You need to sign in to your account to aggregate this event.',
    },
    connectionBtn: {
      id: 'connection-btn',
      defaultMessage: 'Sign In',
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    return onClose();
  };

  const encodeUrl = () => {
    const url = `https://d.openagenda.com/${targetAgenda.slug}?displayAggregatorModal=1`;
    const bytes = utf8.encode(url);
    return base64.encode(bytes);
  };

  const getTitleLink = agenda => `/${agenda.slug}/admin/sources?source=${targetAgenda.slug}&redirect=/${targetAgenda.slug}?aggregateSuccess=1`;

  return (
    <div id="event">
      <Modal classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll onClose={onClose}>
        {success ? (
          <div className="export-form">
            <button className="export-close" type="button" onClick={onClose}>
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export-title-big">{intl.formatMessage(messages.aggregatorTitle)}</h1>
            <p className="margin-bottom-sm">
              {intl.formatMessage(messages.aggregatorSuccess, { targetAgenda: targetAgenda.title })}
            </p>
            <button className="btn btn-primary margin-bottom-sm" type="button" onClick={onClose}>
              OK
            </button>
          </div>
        ) : (
          <div className="export-form" onSubmit={handleSubmit}>
            <button className="export-close" type="button" onClick={onClose}>
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export-title-big">{intl.formatMessage(messages.aggregatorTitle)}</h1>
            <div className="padding-right-sm">
              <p className="text-muted">
                {intl.formatMessage(messages.aggregatorDescription, { targetAgenda: targetAgenda.title })}
              </p>
              <div className="search margin-top-md margin-bottom-sm">
                {!userLogged && (
                  <>
                    <p>{intl.formatMessage(messages.signIn)}</p>
                    <a
                      className="btn btn-primary export-button"
                      href={`https://d.openagenda.com/${targetAgenda.slug}/signin?redirect=${encodeUrl()}`}
                    >
                      {intl.formatMessage(messages.connectionBtn)}
                    </a>
                  </>
                )}
                {userLogged && noAgendas && (
                  <>
                    <p>{intl.formatMessage(messages.noAgenda, { targetAgenda: targetAgenda.title })}</p>
                    <a className="btn btn-primary" href="https://openagenda.com/new">
                      {intl.formatMessage(messages.createAgenda)}
                    </a>
                  </>
                )}
                {userLogged && (
                  <AgendaSearchInput
                    filter={{ role: 'administrator' }}
                    getTitleLink={agenda => getTitleLink(agenda)}
                    res={res}
                    targetAgenda={targetAgenda}
                    noAgendas={bool => setNoAgendas(bool)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AggregatorModal;

AggregatorModal.propTypes = {
  res: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  targetAgenda: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
  }).isRequired,
  success: PropTypes.bool,
  userLogged: PropTypes.bool.isRequired,
};

AggregatorModal.defaultProps = {
  success: false,
};
