import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import { Field, reduxForm } from 'redux-form';
import { renderTextarea } from '../../utils/form';

@reduxForm( {
  form: 'conversation'
} )
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationForm extends Component {
  constructor( props ) {
    super( props );
    this.FormComponent = ::this.FormComponent;
  }

  formatJsonValue( value ) {
    return _.isObject( value ) ? JSON.stringify( value ) : value;
  }

  parseJsonValue( value ) {
    try {
      return JSON.parse( value );
    } catch ( e ) {
      return value;
    }
  }

  FormComponent( { className } ) {
    const { getLabel } = this.props;

    return (
      <div className={className}>
        <Field
          name="destinationInbox"
          component="input"
          type="hidden"
          format={this.formatJsonValue}
          parse={this.parseJsonValue}
        />
        <Field
          name="type"
          component="input"
          type="hidden"
        />
        <Field
          name="params"
          component="input"
          type="hidden"
          format={this.formatJsonValue}
          parse={this.parseJsonValue}
        />
        <Field
          label={getLabel( 'message' )}
          component={renderTextarea}
          name="message"
          className="form-control"
          // classNameGroup="margin-top-md margin-bottom-lg"
          rows="8"
        />
      </div>
    );
  }

  render() {
    const { handleSubmit, children } = this.props;

    return children( {
      handleSubmit,
      FormComponent: this.FormComponent
    } )
  }
}
