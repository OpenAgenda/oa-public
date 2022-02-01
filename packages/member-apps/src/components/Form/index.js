import axios from 'axios';
import React, { useState, useEffect } from 'react';
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
  confirm: {
    id: 'MemberApps.Form.confirm',
    defaultMessage: 'Ok',
  },
  remove: {
    id: 'MemberApps.Form.remove',
    defaultMessage: 'I wish to be removed from the agenda',
  },
  confirmRemove: {
    id: 'MemberApps.Form.confirmRemove',
    defaultMessage: 'Remove me from the agenda',
  },
  removeSuccess: {
    id: 'MemberApps.Form.removeSuccess',
    defaultMessage: 'You are no longer member of the agenda',
  },
  removeFail: {
    id: 'MemberApps.Form.removeFail',
    defaultMessage:
      'The request failed. Try again shortly. If this problem persists, send us a short message at support@openagenda.com',
  },
  confirmRemoveInfo: {
    id: 'MemberApps.Form.confirmRemoveInfo',
    defaultMessage:
      'If you remove yourself from the agenda, you will stop receiving notifications and will no longer be able to edit your events nor add new events. The agenda will stop appearing in your home screen.',
  },
  cancel: {
    id: 'MemberApps.Form.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'MemberApps.Form.save',
    defaultMessage: 'Save',
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
  title, // optional. specify form title
  description, // optional. specify subtitle
  mode, // modal or not
  operation, // update or create
  res, // where to save
  onSuccess, // when save is done
  onRemoveSuccess,
  onCloseModalRequest, // if modal and user clicks to close
  lang,
  showSuccessMessage, // boolean: shows success message after save
  optionalFields, // optional: whether form info should be optional
  displayRemoveAction,
  blockButtons,
  hideCancel,
  member, // optional preloaded member
}) => {
  const query = operation === 'update' && !member
    ? useQuery('getMember', () => axios.get(res), {
      select: ({ data }) => data,
      cacheTime: 0,
    })
    : {};

  const [step, setStep] = useState('form');

  const m = useIntl().formatMessage;

  const isLoading = operation === 'update' && !query.data && !member;

  const loadedMember = member || query.data;

  useEffect(() => {
    if (operation !== 'remove') {
      return;
    }
    setStep('confirmRemove');
  }, [operation]);

  const onSubmitSuccess = data => {
    onSuccess(data);
    if (showSuccessMessage) {
      setStep('success');
    }
  };

  const onRemove = () => {
    onRemoveSuccess();
    setStep('removeSuccess');
  };

  if (['success', 'removeSuccess', 'removeFail'].includes(step)) {
    return Canvas(
      <div className="text-center">
        <p>{m(messages[step])}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (onCloseModalRequest ? onCloseModalRequest() : setStep('form'))}
        >
          {m(messages.confirm)}
        </button>
      </div>,
      { mode }
    );
  }

  if (operation === 'remove' || step === 'confirmRemove') {
    return Canvas(
      <div className="text-center padding-v-sm">
        <p>{m(messages.confirmRemoveInfo)}</p>
        <div>
          <button
            type="button"
            className="btn btn-danger margin-top-sm"
            onClick={() => axios
              .delete(res)
              .then(onRemove)
              .catch(() => setStep('removeFail'))}
          >
            {m(messages.confirmRemove)}
          </button>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-default margin-top-sm"
            onClick={() => (onCloseModalRequest ? onCloseModalRequest() : setStep('form'))}
          >
            {m(messages.cancel)}
          </button>
        </div>
      </div>,
      { mode }
    );
  }

  return Canvas(
    <>
      {isLoading ? <Spinner /> : null}
      {operation === 'update' ? (
        <div>
          <h3>{title !== undefined ? title : m(messages.updateTitle)}</h3>
          <p>
            {description !== undefined ? description : m(messages.description)}
          </p>
        </div>
      ) : null}
      {isLoading ? (
        <BlankComponent />
      ) : (
        <>
          <FormSchemaComponent
            method={operation === 'update' ? 'patch' : 'post'}
            res={{
              patch: res,
              post: res,
            }}
            values={loadedMember}
            schema={schema({ optionalFields })}
            onSubmitSuccess={onSubmitSuccess}
            lang={lang}
            actionComponents={[
              {
                position: 'bottom',
                Component: ({ onSubmit, loading }) => (
                  <div>
                    <button
                      type="button"
                      disabled={loading}
                      className={
                        blockButtons
                          ? 'btn btn-primary btn-block margin-bottom-sm'
                          : 'btn btn-primary pull-right'
                      }
                      onClick={() => onSubmit()}
                    >
                      {m(messages.save)}
                    </button>
                    {hideCancel ? null : (
                      <button
                        type="button"
                        disabled={loading}
                        className={
                          blockButtons
                            ? 'btn btn-default btn-block margin-top-sm'
                            : 'btn btn-default'
                        }
                        onClick={() => (mode === 'modal'
                          ? onCloseModalRequest()
                          : setStep('success'))}
                      >
                        {m(messages.cancel)}
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
          {displayRemoveAction ? (
            <button
              type="button"
              className="btn btn-link text-danger padding-left-z"
              onClick={() => setStep('confirmRemove')}
            >
              {m(messages.remove)}
            </button>
          ) : null}
        </>
      )}
    </>,
    {
      mode,
      onClose: onCloseModalRequest,
    }
  );
};
