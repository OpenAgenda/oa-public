import React, { Component, createElement, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import { Field, reduxForm } from 'redux-form';
import validate from './validate';
import { renderTextarea } from '../../utils/form';

@reduxForm( {
  form: 'conversation',
  validate
} )
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationForm extends Component {
  static propTypes = {
    Wrapper: PropTypes.oneOfType( [
      PropTypes.func,
      PropTypes.element
    ] )
  };

  static defaultProps = {
    Wrapper: 'div'
  };

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

  render() {
    const { getLabel, submit, handleSubmit, submitting, Wrapper } = this.props;

    return createElement(
      Wrapper,
      { handleSubmit, submitting },
      <Fragment>
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
          component={renderTextarea}
          name="message"
          className="form-control"
          classNameGroup="margin-v-xs"
          rows="3"
          getErrorLabel={getLabel}
          onKeyDown={e => {
            if ( e.keyCode === 13 && e.ctrlKey ) {
              submit();
            }
          }}
          placeholder={getLabel( 'yourMessage' )}
        />
      </Fragment>
    );
  }
}
