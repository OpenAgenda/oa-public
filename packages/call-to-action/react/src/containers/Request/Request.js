import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-components/build/Modal';
import { connect } from 'react-redux';
import makeGetterLabel from 'labels';
import labels from 'labels/call-to-action';
import * as actions from '../../redux/modules/callToAction';
import { RequestForm } from '../../components/index';

const ucfirst = str => str.substr( 0, 1 ).toUpperCase() + str.substr( 1 );

@connect(
  state => ({
    lang: state.callToAction.lang,
    opened: state.callToAction.opened,
    subject: state.callToAction.subject,
    agenda: state.callToAction.agenda,
    options: state.callToAction.options
  }),
  actions
)
export default class Request extends Component {

  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  state = {
    confirmationMessage: null
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang )
    };
  }

  close( withError = false ) {
    this.props.closeRequestForm();
    this.setState( {
      confirmationMessage: !withError
    } );
  }

  render() {
    const { opened, sendRequestForm, subject, agenda } = this.props;
    const { confirmationMessage } = this.state;
    const { getLabel } = this.getChildContext();

    const modalTitle = subject && getLabel( 'requestTitle' + ucfirst( subject ) );
    const modalDescription = subject && getLabel( 'requestMessage' + ucfirst( subject ) );

    if ( confirmationMessage !== null ) { // success = true / fail = false
      return (
        <Modal
          title={getLabel( 'confirmationMessage' )}
          onClose={() => this.setState( { confirmationMessage: null } )}
          classNames={{ overlay: 'popup-overlay big' }}
        >
          <div className="margin-top-sm text-center">
            {confirmationMessage ? getLabel( 'requestSuccess' ) : getLabel( 'requestFail' )}
          </div>
        </Modal>
      );
    }

    return (
      <Modal
        title={<div><i className="golden-icon no-hover"></i> {modalTitle || getLabel( 'activationRequest' )}</div>}
        visible={opened}
        onClose={() => this.props.closeRequestForm()}
        classNames={{ overlay: 'popup-overlay big' }}
      >
        {modalDescription && <p dangerouslySetInnerHTML={{ __html: modalDescription.replace( /\n/g, '<br />' ) }}></p>}
        <RequestForm
          subject={subject}
          initialValues={{ subject, agenda, url: window.location.href }}
          onSubmit={ values => sendRequestForm( values )
            .then( () => this.close() )
            .catch( () => this.close( true ) )}
        />
      </Modal>
    );
  }

}
