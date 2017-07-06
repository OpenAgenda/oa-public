import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import validate from './validate';
import { renderField, renderInput, renderTextarea, renderSelect, renderMarkdownInput } from '../../utils/form';

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
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {

    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit} className="invite-members-form">
        <Field
          label={getLabel( 'replyTo' )}
          component={this.renderInput}
          name="replyTo"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'message' )}
          component={this.renderMarkdownInput}
          name="message"
          classNameGroup="margin-top-md margin-bottom-lg"
          displayFeedback={false}
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
