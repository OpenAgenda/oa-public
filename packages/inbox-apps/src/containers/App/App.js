import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { getContext, withContext } from 'recompose';
import moment from 'moment';
import cn from 'classnames';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import Modal from '@openagenda/react-components/build/Modal';
import Spinner from '@openagenda/react-components/build/Spinner';
import * as modalActions from '../../redux/modules/modals';

import 'moment/locale/fr';

@connect(
  state => ({
    res: state.res,
    settings: state.settings,
    modals: state.modals,
    actionLoading: state.conversation.actionLoading
  }),
  { ...modalActions }
)
@withContext(
  {
    lang: PropTypes.string,
    getLabel: PropTypes.func,
  },
  ( { settings } ) => ({
    lang: settings.lang,
    getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, settings.lang )
  })
)
@getContext( {
  lang: PropTypes.string,
  getLabel: PropTypes.func
} )
export default class App extends Component {
  componentWillMount() {
    moment.locale( this.props.lang || 'fr' );
  }

  render() {
    const {
      modals, closeModal, lang,
      settings: { Wrapper }, route, getLabel, actionLoading
    } = this.props;

    const messageSentModal = modals && modals.messageSent || {};
    const closeConfirmationModal = modals && modals.closeConfirmation || {};
    const actionConfirmationModal = modals && modals.actionConfirmation || {};

    const content = (
      <Fragment>
        {renderRoutes( route.routes )}

        {messageSentModal.visible ? <Modal
          title={getLabel( 'messageSent' )}
          onClose={() => closeModal( 'messageSent' )}
          classNames={{ overlay: 'popup-overlay big' }}
        >
          <div className="margin-top-sm text-center">
            {messageSentModal.params.onConversationCreateFlash
              ? messageSentModal.params.onConversationCreateFlash
              : getLabel( 'yourMessageHasBeenSent' )}
          </div>
          <div className="margin-top-sm text-center">
            <button className="btn btn-primary" onClick={() => closeModal( 'messageSent' )}>
              {getLabel( 'close' )}
            </button>
          </div>
        </Modal> : null}

        {closeConfirmationModal.visible ? <Modal
          title={getLabel( 'closeConfirmation' )}
          onClose={() => closeModal( 'closeConfirmation' )}
          classNames={{ overlay: 'popup-overlay big' }}
        >
          <div className="margin-top-sm text-center">{getLabel( 'closeConversationDesc' )}</div>
          <div className="margin-top-sm">
            <button className="btn btn-primary" onClick={() => closeModal( 'closeConfirmation' )}>
              {getLabel( 'cancel' )}
            </button>
            <button className="btn btn-danger pull-right" onClick={async () => {
              await closeConfirmationModal.params.onAction( closeConfirmationModal.params.action.code );
              closeModal( 'closeConfirmation' );
            }}>
              {getLabel( 'close' )}

              {actionLoading && (
                <span className="margin-h-sm">
                  <Spinner mode="inline" />
                </span>
              )}
            </button>
          </div>
        </Modal> : null}

        {actionConfirmationModal.visible ? <Modal
          title={actionConfirmationModal.params.action.confirmationModalTitle[ lang ]}
          onClose={() => closeModal( 'actionConfirmation' )}
          classNames={{ overlay: 'popup-overlay big' }}
        >
          <div className="margin-top-sm text-center">
            {actionConfirmationModal.params.action.confirmationModalLabel[ lang ]}
          </div>
          <div className="margin-top-sm">
            <button className="btn btn-primary" onClick={() => closeModal( 'actionConfirmation' )}>
              {getLabel( 'cancel' )}
            </button>
            <button
              className={cn( 'btn', `btn-${actionConfirmationModal.params.action.kind}`, 'pull-right' )}
              onClick={async () => {
                await actionConfirmationModal.params.onAction( actionConfirmationModal.params.action.code );
                closeModal( 'actionConfirmation' );
              }}
            >
              {getLabel( 'confirm' )}

              {actionLoading && (
                <span className="margin-h-sm">
                  <Spinner mode="inline" />
                </span>
              )}
            </button>
          </div>
        </Modal> : null}
      </Fragment>
    );

    if ( Wrapper ) {
      return (
        <Wrapper>
          {content}
        </Wrapper>
      );
    }

    return content;
  }
}
