import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { renderField, renderMarkdownInput } from '../../utils/form';

@reduxForm( {
  form: 'request'
} )
export default class RequestForm extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  constructor( props ) {
    super( props );
    this.renderField = this::renderField;
    this.renderMarkdownInput = this::renderMarkdownInput;
  }

  render() {
    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="subject"
          component="input"
          type="hidden"
        />
        <Field
          name="agenda"
          component="input"
          type="hidden"
        />
        <Field
          name="url"
          component="input"
          type="hidden"
        />
        <Field
          label={getLabel( 'message' )}
          component={this.renderMarkdownInput}
          name="message"
          classNameGroup="margin-top-md margin-bottom-lg"
          displayFeedback={false}
        />

        <button type="submit" className="btn btn-primary center-block">{getLabel( 'send' )}</button>
      </form>
    );
  }

}
