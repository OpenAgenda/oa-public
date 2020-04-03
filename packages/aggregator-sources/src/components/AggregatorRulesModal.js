import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Modal from '@openagenda/react-components/build/Modal';
import DefineRules from './DefineRules';

const messages = defineMessages({
  modalTitle: {
    id: 'aggregator-sources.AggregatorRulesModal.modalTitle',
    defaultMessage: 'Aggregator rules'
  }
});

const modalClassnames = {
  overlay: 'popup-overlay big'
};

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
        initialRules={aggregator.rules}
        disableMissingFieldsValidation
        onSubmit={onSubmit}
        onCancel={onClose}
        isAggregator
      />
    </Modal>
  );
}
