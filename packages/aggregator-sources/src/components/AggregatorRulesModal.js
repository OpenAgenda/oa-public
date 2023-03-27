import { defineMessages, useIntl } from 'react-intl';
import { Modal } from '@openagenda/react-shared';
import DefineRules from './DefineRules';

const messages = defineMessages({
  modalTitle: {
    id: 'aggregator-sources.AggregatorRulesModal.modalTitle',
    defaultMessage: 'Aggregator rules',
  },
});

const modalClassnames = {
  overlay: 'popup-overlay big',
};

export default function AggregatorRulesModal({
  aggregator,
  aggregatorAgenda,
  aggregatorAgendaSchema,
  onSubmit,
  onClose,
}) {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      onClose={onClose}
      classNames={modalClassnames}
    >
      <DefineRules
        aggregatorAgenda={aggregatorAgenda}
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
