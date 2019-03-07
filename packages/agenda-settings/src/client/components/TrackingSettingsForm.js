import _ from 'lodash';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import cn from 'classnames';
import PropTypes from 'prop-types';

function validate( values ) {
  const errors = {};

  if ( values.googleAnalytics && values.googleAnalytics.length > 255 ) {
    errors.subject = 'string.toolong';
  }

  return errors;
}

@connect( state => ({
  initialValues: {
    googleAnalytics: _.get( state, 'agenda.data.settings.tracking.googleAnalytics', null )
  }
}) )
@reduxForm( {
  form: 'trackingSettings',
  validate
} )
export default class TrackingSettingsForm extends Component {
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
        <p>{getLabel( 'statsDescription' )}</p>

        <Field
          name="googleAnalytics"
          component={this.renderField}
          type="text"
          label={getLabel( 'googleAnalyticsId' )}
          placeholder="GA_TRACKING_ID"
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
