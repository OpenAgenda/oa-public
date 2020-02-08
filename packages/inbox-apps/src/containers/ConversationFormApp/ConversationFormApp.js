import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import Modal from '@openagenda/react-components/build/Modal';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import I18nContext from '../../contexts/I18nContext';
import * as actions from '../../reducers/conversationForm';
import { ConversationForm } from '../../components';

@connect(
  state => ({
    opened: state.conversationForm.opened,
    lang: state.conversationForm.data.lang,
    initialValues: state.conversationForm.data
  }),
  actions
)
export default class ConversationFormApp extends Component {
  static contextType = I18nContext;

  state = {
    confirmationMessage: null
  };

  getLabel = (label, values = {}) => makeGetterLabel(labels)(label, values, this.props.lang);

  i18nContextValue = {
    lang: this.props.lang,
    getLabel: this.getLabel
  };

  close( withError = false ) {
    this.setState( {
      confirmationMessage: !withError
    } );
  }

  FormWrapper = ({ children, handleSubmit, error }) => {
    const { getLabel } = this;

    return (
      <form onSubmit={handleSubmit} className="conversation-form">
        <div className="margin-v-md">
          {children}

          {error ? <p className="text-danger">{error}</p> : null}
        </div>

        <button
          type="submit"
          className="btn btn-primary center-block"
        >
          {getLabel('send')}
        </button>
      </form>
    );
  };

  render() {
    const { opened, createConversation, closeConversationForm, initialValues } = this.props;
    const { getLabel } = this;
    const { confirmationMessage } = this.state;

    if ( !opened ) {
      return null;
    }

    const { type } = initialValues;

    const modalTitle = type && getLabel( 'title' + _.upperFirst( _.camelCase( type ) ) );
    const modalDescription = type && getLabel( 'message' + _.upperFirst( _.camelCase( type ) ) );

    if ( confirmationMessage !== null ) { // success = true / fail = false
      return (
        <I18nContext.Provider value={this.i18nContextValue}>
          <Modal
            title={getLabel( 'newConversation' )}
            onClose={() => {
              this.setState( { confirmationMessage: null } );
              closeConversationForm();
            }}
            classNames={{ overlay: 'popup-overlay big' }}
          >
            <div className="margin-top-sm text-center">
              {getLabel( confirmationMessage ? 'creationSuccess' : 'creationFail' )}
            </div>
          </Modal>
        </I18nContext.Provider>
      );
    }

    return (
      <I18nContext.Provider value={this.i18nContextValue}>
        <Modal
          title={modalTitle || getLabel( 'newConversation' )}
          visible={opened}
          onClose={() => closeConversationForm()}
          classNames={{ overlay: 'popup-overlay big' }}
        >
          {modalDescription && <p dangerouslySetInnerHTML={{ __html: modalDescription.replace( /\n/g, '<br />' ) }}></p>}
          <ConversationForm
            initialValues={initialValues}
            onSubmit={values => createConversation( values )
              .then( () => this.close() )
              .catch( () => this.close( true ) )}
            Wrapper={this.FormWrapper}
          />
        </Modal>
      </I18nContext.Provider>
    );
  }
}
