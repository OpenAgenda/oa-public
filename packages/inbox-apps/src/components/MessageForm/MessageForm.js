import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { getContext } from 'recompose';
import validate from './validate';
import { AuthorAvatar } from '../';
import { renderTextarea } from '../../utils/form';

@reduxForm( {
  validate
} )
@getContext( {
  getLabel: PropTypes.func
} )
export default class MessageForm extends Component {
  static propTypes = {
    Wrapper: PropTypes.oneOfType( [
      PropTypes.func,
      PropTypes.element
    ] )
  };

  static defaultProps = {
    Wrapper: 'div'
  };

  render() {
    const { handleSubmit, submit, submitting, getLabel, Wrapper, error } = this.props;

    return createElement(
      Wrapper,
      { handleSubmit, submitting, error },
      <Field
        component={renderTextarea}
        name="body"
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
    );
  }
}
