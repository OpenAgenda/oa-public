import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Modal } from '@openagenda/react-components';
import DefineRules from './DefineRules';

const messages = defineMessages({
  updateASource: {
    id: 'aggregator-sources.UpdateSourceModal.updateASource',
    defaultMessage: 'Aggregation rules',
  },
  updateSource: {
    id: 'aggregator-sources.UpdateSourceModal.updateSource',
    defaultMessage: 'Update',
  },
  cancel: {
    id: 'aggregator-sources.UpdateSourceModal.cancel',
    defaultMessage: 'Cancel',
  },
});

const modalClassnames = {
  overlay: 'popup-overlay big',
};

export default function UpdateSourceModal({
  onSubmit,
  onClose,
  aggregator,
  aggregatorAgenda,
  aggregatorAgendaSchema,
}) {
  const intl = useIntl();

  const data = useSelector(state => state.modals.updateSource) || {
    source: {},
  };

  const handleSubmit = useCallback(rules => onSubmit(data.source, rules), [
    onSubmit,
    data.source,
  ]);

  return (
    <Modal
      title={`${data.source.agenda.title} | ${intl.formatMessage(
        messages.updateASource
      )}`}
      onClose={onClose}
      classNames={modalClassnames}
    >
      <DefineRules
        displayInfo={false}
        aggregator={aggregator}
        aggregatorAgenda={aggregatorAgenda}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        sourceAgenda={data.source.agenda}
        sourceSchema={data.schema}
        initialRules={data.source.rules}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
