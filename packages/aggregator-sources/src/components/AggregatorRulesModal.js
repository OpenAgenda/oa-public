import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Modal from '@openagenda/react-components/build/Modal';
import DefineRules from './DefineRules';

const messages = defineMessages({
  modalTitle: {
    id: 'aggregator-sources.AggregatorRulesModal.modalTitle',
    defaultMessage: 'Aggregator rules'
  },
  cancel: {
    id: 'aggregator-sources.AggregatorRulesModal.cancel',
    defaultMessage: 'Cancel'
  },
  save: {
    id: 'aggregator-sources.AggregatorRulesModal.save',
    defaultMessage: 'Save'
  }
});

const modalClassnames = {
  overlay: 'popup-overlay big'
};

function RulesSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();

  return (
    <div className="margin-top-md">
      <div className="pull-left">
        <button
          type="button"
          className="btn btn-link text-danger cancel-button-left"
          onClick={onCancel}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
      </div>
      <div className="text-right">
        <button
          onClick={handleSubmit}
          type="button"
          className="btn btn-primary"
        >
          {intl.formatMessage(messages.save)}
        </button>
      </div>
    </div>
  );
}

export default function AggregatorRulesModal({
  aggregator,
  aggregatorAgendaSchema,
  onSubmit,
  onClose
}) {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      onClose={onClose}
      classNames={modalClassnames}
    >
      <DefineRules
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        SubmitButton={RulesSubmitButton}
        initialRules={aggregator.rules}
        disableMissingFieldsValidation
        onSubmit={onSubmit}
        onCancel={onClose}
        isAggregator
      />
    </Modal>
  );
}
