import React, { useMemo, useCallback, useEffect } from 'react';
import { provideHooks } from 'redial';
import { useStore, useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import cn from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import { useApiClient, useLayoutData, Modal, Spinner } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';
import inboxReducer from '../../reducers/inbox';
import conversationReducer from '../../reducers/conversation';
import conversationFormReducer from '../../reducers/conversationForm';
import modalsReducer, * as modalsActions from '../../reducers/modals';

const overlayStyle = { overlay: 'popup-overlay big' };

function App({ route }) {
  const store = useStore();

  const { lang } = useLayoutData();

  const { Wrapper } = useSelector(state => state.settings);
  const res = useSelector(state => state.res);
  const modals = useSelector(state => state.modals);
  const actionLoading = useSelector(state => state.conversation.actionLoading);

  const apiClient = useApiClient();

  useEffect(
    () => {
      if (res.refreshCheck) {
        apiClient.get(res.refreshCheck).catch(null);
      }
    },
    [apiClient, res.refreshCheck]
  );

  const getLabel = useCallback(
    (label, values = {}) => makeGetterLabel(labels)(label, values, lang),
    [lang]
  );

  const i18nContextValue = useMemo(
    () => ({
      lang: lang,
      getLabel: getLabel
    }),
    [lang, getLabel]
  );

  const closeModalMessageSent = useCallback(
    () => store.dispatch(modalsActions.closeModal('messageSent')),
    [store.dispatch]
  );
  const closeModalCloseConfirmation = useCallback(
    () => store.dispatch(modalsActions.closeModal('closeConfirmation')),
    [store.dispatch]
  );
  const closeModalActionConfirmation = useCallback(
    () => store.dispatch(modalsActions.closeModal('actionConfirmation')),
    [store.dispatch]
  );

  const confirmModalCloseConfirmation = useCallback(
    () => modals.closeConfirmation.params.onAction(modals.closeConfirmation.params.action.code)
      .finally(() => store.dispatch(modalsActions.closeModal('closeConfirmation'))),
    [store.dispatch, modals.closeConfirmation]
  );
  const confirmModalActionConfirmation = useCallback(
    () => modals.actionConfirmation.params.onAction(modals.actionConfirmation.params.action.code)
      .finally(() => store.dispatch(modalsActions.closeModal('actionConfirmation'))),
    [store.dispatch, modals.actionConfirmation]
  );

  const content = (
    <I18nContext.Provider value={i18nContextValue}>
      {renderRoutes(route.routes)}

      {modals.messageSent && modals.messageSent.visible ? (
        <Modal
          title={getLabel('messageSent')}
          onClose={closeModalMessageSent}
          classNames={overlayStyle}
        >
          <div className="margin-top-sm text-center">
            {modals.messageSent.params.onConversationCreateFlash
              ? modals.messageSent.params.onConversationCreateFlash
              : getLabel('yourMessageHasBeenSent')}
          </div>
          <div className="margin-top-sm text-center">
            <button className="btn btn-primary" onClick={closeModalMessageSent}>
              {getLabel('close')}
            </button>
          </div>
        </Modal>
      ) : null}

      {modals.closeConfirmation && modals.closeConfirmation.visible ? (
        <Modal
          title={getLabel('closeConversation')}
          onClose={closeModalCloseConfirmation}
          classNames={overlayStyle}
        >
          <div className="margin-top-sm text-center">{getLabel('closeConversationDesc')}</div>
          <div className="margin-top-sm">
            <button className="btn btn-primary" onClick={closeModalCloseConfirmation}>
              {getLabel('cancel')}
            </button>
            <button className="btn btn-danger pull-right" onClick={confirmModalCloseConfirmation}>
              {getLabel('close')}

              {actionLoading && (
                <span className="margin-h-sm">
                <Spinner mode="inline" />
              </span>
              )}
            </button>
          </div>
        </Modal>
      ) : null}

      {modals.actionConfirmation && modals.actionConfirmation.visible ? (
        <Modal
          title={modals.actionConfirmation.params.action.confirmationModalTitle[lang]}
          onClose={closeModalActionConfirmation}
          classNames={overlayStyle}
        >
          <div className="margin-top-sm text-center">
            {modals.actionConfirmation.params.action.confirmationModalLabel[lang]}
          </div>
          <div className="margin-top-sm">
            <button className="btn btn-primary" onClick={closeModalActionConfirmation}>
              {getLabel('cancel')}
            </button>
            <button
              className={cn('btn', `btn-${modals.actionConfirmation.params.action.kind}`, 'pull-right')}
              onClick={confirmModalActionConfirmation}
            >
              {getLabel('confirm')}

              {actionLoading && (
                <span className="margin-h-sm">
                <Spinner mode="inline" />
              </span>
              )}
            </button>
          </div>
        </Modal>
      ) : null}
    </I18nContext.Provider>
  );

  if (Wrapper) {
    return (
      <Wrapper>
        {content}
      </Wrapper>
    );
  }

  return content;
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    inbox: inboxReducer,
    conversation: conversationReducer,
    conversationForm: conversationFormReducer,
    modals: modalsReducer
  })
})(App);
