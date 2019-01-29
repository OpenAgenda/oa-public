import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import validate from './validate';
import {
  renderField,
  renderInput,
  renderTextarea,
  renderSelect,
  renderMarkdownInput,
  renderCheckbox
} from '../../utils/form';

@reduxForm( {
  form: 'writeToMembers',
  validate
} )
export default class SendMessageForm extends Component {

  constructor( props ) {
    super( props );
    this.renderField = this::renderField;
    this.renderInput = this::renderInput;
    this.renderTextarea = this::renderTextarea;
    this.renderSelect = this::renderSelect;
    this.renderMarkdownInput = this::renderMarkdownInput;
    this.renderCheckbox = this::renderCheckbox;
  }

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  renderInactiveCheckbox( props ) {
    const inputAttrs = { placeholder, className };

    return (
      <input {...props.input} {...inputAttrs} />
    );
  }

  render() {

    const { handleSubmit } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <form onSubmit={handleSubmit} className="invite-members-form">
        <Field
          label={getLabel( 'replyTo' )}
          component={this.renderInput}
          name="replyTo"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
          placeholder={lang === 'fr' ? 'ne-pas-repondre@openagenda.com' : 'no-reply@openagenda.com'}
        />
        <Field
          label={getLabel( 'message' )}
          component={this.renderMarkdownInput}
          name="message"
          classNameGroup="margin-top-md margin-bottom-lg"
          displayFeedback={false}
          loadComponent={
            <div style={{ height: '200px', position: 'relative' }}>
              <Spinner/>
            </div>
          }
        />

        <Field
          label={getLabel( 'sendOnlyToInactives' )}
          component={this.renderCheckbox}
          name="inactive"
          type="checkbox"
          classNameGroup="margin-v-md"
        />

        <div className="text-center">
          <button className="btn btn-primary" role="submit">
            {getLabel( 'sendMessage' )}
          </button>
        </div>
      </form>
    );

  }

}
