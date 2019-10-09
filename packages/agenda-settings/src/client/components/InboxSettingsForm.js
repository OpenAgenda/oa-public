import _ from 'lodash';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { email as emailValidator } from '@openagenda/validators';

const isEmail = emailValidator();

function validate( values ) {
  const errors = {};

  if ( values.email ) {
    try {
      isEmail( values.email );
    } catch ( e ) {
      errors.email = 'email.invalid';
    }
  }

  if ( !values.enabled && !values.email ) {
    errors.email = 'required';
  }

  if ( values.subject && values.subject.length > 255 ) {
    errors.subject = 'string.toolong';
  }

  return errors;
}

@connect( state => ({
  initialValues: {
    enabled: _.get( state, 'agenda.data.settings.inbox.mailto.enabled', false ),
    email: _.get( state, 'agenda.data.settings.inbox.mailto.email', null ),
    subject: _.get( state, 'agenda.data.settings.inbox.mailto.subject', null )
  }
}) )
@reduxForm( {
  form: 'inboxSettings',
  validate
} )
export default class InboxSettingsForm extends Component {
  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderField = ( {
    input,
    label,
    type,
    meta: { touched, error, warning },
    className,
    placeholder,
    Description
  } ) => (
    <div className="form-group">
      <label htmlFor={input.name}>{label}</label>
      <div>
        {Description && <Description />}
        <input {...input} className={className} placeholder={placeholder} type={type} />
        {touched && error && (
          <div className="text-danger">{this.context.getLabel( error )}</div>
        )}
      </div>
    </div>
  );

  render() {
    const { handleSubmit, pristine, invalid } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="checkbox">
            <label>
              <Field
                name="enabled" /* mailto enabled, inbox disabled */
                component="input"
                type="checkbox"
              />
              {getLabel( 'enableMailtoDesc' )}
            </label>
          </div>
        </div>

        <Field
          name="email"
          component={this.renderField}
          type="text"
          label={getLabel( 'receptionEmail' )}
          placeholder={getLabel( 'emailPlaceholder' )}
          className="form-control"
          Description={() => (
            <div>{getLabel( 'mailtoEmailDesc' )}</div>
          )}
        />

        <Field
          name="subject"
          component={this.renderField}
          type="text"
          label={getLabel( 'subjectLabel' )}
          placeholder={getLabel( 'subjectDesc' )}
          className="form-control"
        />

        <button
          type="submit"
          className={cn( 'btn btn-primary', { disabled: pristine || invalid } )}
          disabled={pristine || invalid ? true : undefined}
        >
          {getLabel( 'update' )}
        </button>
      </form>
    );
  }
}
