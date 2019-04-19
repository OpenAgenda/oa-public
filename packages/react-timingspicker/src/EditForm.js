import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { Form, Field } from 'react-final-form';
import MaskedInput from 'react-text-mask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';

const autoCorrectedTimePipe = createAutoCorrectedDatePipe( 'HH:MM' );
const timeRegex = /\d{2}:\d{2}/;
const timeMask = [ /\d/, /\d/, ':', /\d/, /\d/ ];

const messages = defineMessages( {
  title: {
    id: 'rtp.editForm.title',
    defaultMessage: 'Edit timing'
  },
  invalidTime: {
    id: 'rtp.editForm.invalidTime',
    defaultMessage: 'Invalid time'
  },
  startTime: {
    id: 'rtp.editForm.startTime',
    defaultMessage: 'Start time'
  },
  endTime: {
    id: 'rtp.editForm.endTime',
    defaultMessage: 'End time'
  },
  adjust: {
    id: 'rtp.editForm.adjust',
    defaultMessage: 'Adjust'
  },
  endNotAfterBegin: {
    id: 'rtp.editForm.endNotAfterBegin',
    defaultMessage: 'End should be after begin'
  }
} );


function validateTime( value ) {
  if ( !timeRegex.test( value ) ) {
    return 'invalidTime';
  }
}

function MaskedTimeInput( { input, meta, label, classNamePrefix, intl, ...rest } ) {
  return (
    <section>
      {label ? <div>{label}</div> : null}

      <MaskedInput
        {...input}
        {...rest}
        mask={timeMask}
        pipe={autoCorrectedTimePipe}
        keepCharPositions
      />

      {meta.touched && meta.error ? (
        <div className={`${classNamePrefix}input-error`}>
          {intl.formatMessage( messages[ meta.error ] )}
        </div>
      ) : null}
    </section>
  );
};

class EditForm extends Component {
  subscription = { submitError: true };

  renderForm = ( { handleSubmit, submitError, classNamePrefix, intl } ) => (
    <form onSubmit={handleSubmit}>
      <h3>{intl.formatMessage( messages.title )}</h3>

      <Field
        name="begin"
        placeholder="09:00"
        // type="time" /* is not supported in Safari or Internet Explorer 12 and earlier versions */
        label={intl.formatMessage( messages.startTime )}
        component={MaskedTimeInput}
        validate={validateTime}
        autoComplete="off"
        classNamePrefix={classNamePrefix}
        intl={intl}
      />

      <Field
        name="end"
        placeholder="18:00"
        // type="time" /* is not supported in Safari or Internet Explorer 12 and earlier versions */
        label={intl.formatMessage( messages.endTime )}
        component={MaskedTimeInput}
        validate={validateTime}
        autoComplete="off"
        classNamePrefix={classNamePrefix}
        intl={intl}
      />

      <button type="submit">{intl.formatMessage( messages.adjust )}</button>

      {submitError && (
        <div className={`${classNamePrefix}error`}>
          {intl.formatMessage( messages[ submitError ] )}
        </div>
      )}
    </form>
  );

  render() {
    const { onSubmit, initialValues, classNamePrefix, intl } = this.props;

    return (
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        subscription={this.subscription}
        render={this.renderForm}
        classNamePrefix={classNamePrefix}
        intl={intl}
      />
    );
  }
}

export default injectIntl( EditForm, { withRef: true } );
