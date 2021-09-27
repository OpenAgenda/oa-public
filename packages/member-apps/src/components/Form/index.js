import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';
import Spinner from '@openagenda/react-shared/lib/components/Spinner';
import Modal from '@openagenda/react-shared/lib/components/Modal';
import schema from './schema';

const messages = defineMessages({
  updateTitle: {
    id: 'MemberApps.Form.updateTitle',
    defaultMessage: 'Update your coordinates',
  },
  description: {
    id: 'MemberApps.Form.description',
    defaultMessage:
      'This information will allow the agenda administrators to get in touch with you if needed.',
  },
  success: {
    id: 'MemberApps.Form.success',
    defaultMessage: 'The update was successful',
  },
  confirmSuccess: {
    id: 'MemberApps.Form.confirmSuccess',
    defaultMessage: 'Ok',
  },
});

const BlankComponent = () => <FormSchemaComponent schema={schema} />;

const Canvas = (content, { mode, onClose }) => (mode === 'modal' ? (
  <Modal
    onClose={onClose}
    classNames={{
      overlay: 'popup-overlay big',
    }}
    disableBodyScroll
  >
    {content}
  </Modal>
) : (
  content
));

export default ({
  mode,
  operation,
  res,
  onSuccess,
  onCloseModalRequest,
  lang,
  showSuccessMessage,
}) => {
  const query = operation === 'update'
    ? useQuery('getMember', () => axios.get(res), {
      select: ({ data }) => data,
      cacheTime: 0,
    })
    : {};

  const [step, setStep] = useState('form');

  const m = useIntl().formatMessage;

  const isLoading = operation === 'update' && !query.data;

  const onSubmitSuccess = data => {
    onSuccess(data);
    if (showSuccessMessage) {
      setStep('success');
    }
  };

  if (mode === 'modal' && step === 'success') {
    return Canvas(
      <div className="text-center">
        <p>{m(messages.success)}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (onCloseModalRequest ? onCloseModalRequest() : null)}
        >
          {m(messages.confirmSuccess)}
        </button>
      </div>,
      { mode }
    );
  }

  return Canvas(
    <>
      {isLoading ? <Spinner /> : null}
      {operation === 'update' ? (
        <div>
          <h3>{m(messages.updateTitle)}</h3>
          <p>{m(messages.description)}</p>
        </div>
      ) : null}
      {isLoading ? (
        <BlankComponent />
      ) : (
        <FormSchemaComponent
          method="patch"
          res={{
            patch: res,
          }}
          values={query.data}
          schema={schema}
          onSubmitSuccess={onSubmitSuccess}
          onCancel={() => (mode === 'modal' ? onCloseModalRequest() : setStep('success'))}
          lang={lang}
        />
      )}
    </>,
    {
      mode,
      onClose: onCloseModalRequest,
    }
  );
};
