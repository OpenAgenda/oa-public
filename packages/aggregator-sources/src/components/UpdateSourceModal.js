import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Modal from '@openagenda/react-components/build/Modal';
import DefineRules from './DefineRules';

const messages = defineMessages({
  updateSource: {
    id: 'aggregator-sources.UpdateSourceModal.updateSource',
    defaultMessage: 'Update a source'
  }
});

function SubmitButton({ handleSubmit }) {
  const intl = useIntl();

  return (
    <div className="text-center">
      <button onClick={handleSubmit} type="button" className="btn btn-primary">
        {intl.formatMessage(messages.updateSource)}
      </button>
    </div>
  );
}

export default function UpdateSourceModal({ onSubmit, onClose }) {
  const intl = useIntl();

  const data = useSelector(state => state.modals.updateSource) || {
    source: {}
  };

  const handleSubmit = useCallback(rules => onSubmit(data.source, rules), [
    onSubmit,
    data.source
  ]);

  return (
    <Modal title={intl.formatMessage(messages.updateSource)} onClose={onClose}>
      <div className="margin-v-sm">
        <DefineRules
          initialRules={data.source.rules}
          onSubmit={handleSubmit}
          SubmitButton={SubmitButton}
        />
      </div>
    </Modal>
  );
}
