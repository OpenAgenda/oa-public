import React, { useCallback } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';
import Modal from '@openagenda/react-components/build/Modal';

const messages = defineMessages({
  removeASource: {
    id: 'aggregator-sources.RemoveSourceModal.removeASource',
    defaultMessage: 'Remove a source'
  },
  removeSource: {
    id: 'aggregator-sources.RemoveSourceModal.removeSource',
    defaultMessage: 'Remove source'
  },
  cancel: {
    id: 'aggregator-sources.RemoveSourceModal.cancel',
    defaultMessage: 'Cancel'
  }
});

const Radio = ({ id, input, children }) => (
  <label htmlFor={id}>
    <input type="radio" id={id} {...input} />
    {children}
  </label>
);

export default function RemoveSourceModal({ onRemove, onClose }) {
  const intl = useIntl();

  const data = useSelector(state => state.modals.removeSource) || {
    source: {}
  };

  const confirmRemove = useCallback(
    values => onRemove(data.source, values.evaluate),
    [onRemove, data.source]
  );

  if (!data.visible) {
    return null;
  }

  return (
    <Modal title={intl.formatMessage(messages.removeASource)} onClose={onClose}>
      <Form onSubmit={confirmRemove}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className="margin-v-sm">
              <p>
                <FormattedMessage
                  id="aggregator-sources.RemoveSourceModal.removeConfirmMessage"
                  defaultMessage="Events that will be published on the agenda <b>{agenda}</b> will no longer be aggregated.{br} Are you sure you want to delete this agenda from sources ?"
                  values={{
                    agenda: <b>{data.source.title}</b>,
                    br: <br />
                  }}
                />
              </p>

              <Field
                name="evaluate"
                type="radio"
                value="0"
                component={Radio}
                initialValue="0"
              >
                {' '}
                <FormattedMessage
                  id="aggregator-sources.RemoveSourceModal.evaluateKeepEvents"
                  defaultMessage="Yes, but I want to keep events already aggregated"
                />
              </Field>

              <br />

              <Field name="evaluate" type="radio" value="1" component={Radio}>
                {' '}
                <FormattedMessage
                  id="aggregator-sources.RemoveSourceModal.evaluateRemoveEvents"
                  defaultMessage="Yes, and I also want to remove already aggregated events"
                />
              </Field>
            </div>

            <div className="pull-left">
              <button type="button" className="btn btn-link" onClick={onClose}>
                {intl.formatMessage(messages.cancel)}
              </button>
            </div>
            <div className="text-right">
              <button type="submit" className="btn btn-danger">
                {intl.formatMessage(messages.removeSource)}
              </button>
            </div>
          </form>
        )}
      </Form>
    </Modal>
  );
}
