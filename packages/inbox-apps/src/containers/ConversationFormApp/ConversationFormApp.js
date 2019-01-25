import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withContext, getContext } from 'recompose';
import Modal from '@openagenda/react-components/build/Modal';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import * as actions from '../../redux/modules/conversationForm';
import { ConversationForm } from '../../components';

@connect(
  state => ({
    opened: state.conversationForm.opened,
    lang: state.conversationForm.data.lang,
    initialValues: state.conversationForm.data
  }),
  actions
)
@withContext(
  {
    lang: PropTypes.string,
    getLabel: PropTypes.func,
  },
  ( { lang } ) => ({
    lang,
    getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang )
  })
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationModal extends Component {
  state = {
    confirmationMessage: null
  };

  close( withError = false ) {
    this.setState( {
      confirmationMessage: !withError
    } );
  }

  FormWrapper = ( { children, handleSubmit, error } ) => {
    const { getLabel } = this.props;

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
          {getLabel( 'send' )}
        </button>
      </form>
    );
  }

  render() {
    const { opened, createConversation, closeConversationForm, getLabel, initialValues } = this.props;
    const { confirmationMessage } = this.state;

    if ( !opened ) {
      return null;
    }

    const { type } = initialValues;

    const modalTitle = type && getLabel( 'title' + _.upperFirst( _.camelCase( type ) ) );
    const modalDescription = type && getLabel( 'message' + _.upperFirst( _.camelCase( type ) ) );

    if ( confirmationMessage !== null ) { // success = true / fail = false
      return (
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
      );
    }

    return (
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
    );
  }
}
