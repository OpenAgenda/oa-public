import React, { useCallback } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Field } from 'react-final-form';
import Modal from '@openagenda/react-components/build/Modal';
import * as modalsActions from '../reducers/modals';
import * as sourcesActions from '../reducers/sources';

const messages = defineMessages({
  removeSource: {
    id: 'aggregator-sources.RemoveSourceModal.removeSource',
    defaultMessage: 'Remove source'
  }
});

const Radio = ({ id, input, children }) => (
  <label htmlFor={id}>
    <input type="radio" id={id} {...input} />
    {children}
  </label>
);

export default function RemoveSourceModal() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const data = useSelector(state => state.modals.removeSource) || {
    source: {}
  };

  const closeModal = useCallback(
    () => dispatch(modalsActions.closeModal('removeSource')),
    [dispatch]
  );

  const confirmRemove = useCallback(
    values => dispatch(
      sourcesActions.remove(data.source.uid, { evaluate: values.evaluate })
    ).then(() => closeModal('removeSource')),
    [dispatch, data.source.uid, closeModal]
  );

  if (!data.visible) {
    return null;
  }

  return (
    <Modal
      title={intl.formatMessage(messages.removeSource)}
      onClose={closeModal}
    >
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
              <button
                type="button"
                className="btn btn-link"
                onClick={closeModal}
              >
                Annuler
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
