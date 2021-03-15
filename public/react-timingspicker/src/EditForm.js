import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { Form, Field } from 'react-final-form';
import MaskedInput from 'react-text-mask';
import * as dateFns from 'date-fns';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { FORM_ERROR } from 'final-form';
import { FaRegTimesCircle } from 'react-icons/fa';

const autoCorrectedTimePipe = createAutoCorrectedDatePipe('HH:MM');
const timeRegex = /\d{2}:\d{2}/;
const timeMask = [/\d/, /\d/, ':', /\d/, /\d/];

const messages = defineMessages({
  title: {
    id: 'rtp.editForm.title',
    defaultMessage: 'Edit timing',
  },
  invalidTime: {
    id: 'rtp.editForm.invalidTime',
    defaultMessage: 'Invalid time',
  },
  startTime: {
    id: 'rtp.editForm.startTime',
    defaultMessage: 'Start time',
  },
  endTime: {
    id: 'rtp.editForm.endTime',
    defaultMessage: 'End time',
  },
  adjust: {
    id: 'rtp.editForm.adjust',
    defaultMessage: 'Adjust',
  },
  endNotAfterBegin: {
    id: 'rtp.editForm.endNotAfterBegin',
    defaultMessage: 'End should be after begin',
  },
  openRecurrencerModal: {
    id: 'rtp.editForm.openRecurrencerModal',
    defaultMessage: 'Define a recurring timing',
  },
});

function validateTime(value) {
  if (!timeRegex.test(value)) {
    return 'invalidTime';
  }
}

function MaskedTimeInput({
  input,
  meta,
  label,
  classNamePrefix,
  intl,
  ...rest
}) {
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
          {intl.formatMessage(messages[meta.error])}
        </div>
      ) : null}
    </section>
  );
}

class EditForm extends Component {
  subscription = { submitError: true };

  handleSubmit = (values, ...rest) => {
    const { valueToEdit, onSubmit } = this.props;
    const { begin, end } = values;
    const [beginHours, beginMinutes] = begin.split(':');
    const [endHours, endMinutes] = end.split(':');

    const newValue = {
      begin: dateFns.setHours(
        dateFns.setMinutes(valueToEdit.begin, parseInt(beginMinutes, 10)),
        parseInt(beginHours, 10)
      ),
      end: dateFns.setHours(
        dateFns.setMinutes(valueToEdit.end, parseInt(endMinutes, 10)),
        parseInt(endHours, 10)
      ),
    };

    if (!dateFns.isAfter(newValue.end, newValue.begin)) {
      return {
        [FORM_ERROR]: new Error('endNotAfterBegin'),
      };
    }

    if (typeof onSubmit === 'function') {
      return onSubmit(newValue, ...rest);
    }
  };

  renderForm = ({
    handleSubmit,
    submitError,
    classNamePrefix,
    intl,
    openRecurrencerModal,
    closeModal,
  }) => (
    <form onSubmit={handleSubmit}>
      <h3>{intl.formatMessage(messages.title)}</h3>

      {typeof closeModal === 'function' ? (
        <div className={`${classNamePrefix}close-modal`}>
          <FaRegTimesCircle onClick={closeModal} />
        </div>
      ) : null}

      <Field
        name="begin"
        placeholder="09:00"
        // type="time" /* is not supported in Safari or Internet Explorer 12 and earlier versions */
        label={intl.formatMessage(messages.startTime)}
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
        label={intl.formatMessage(messages.endTime)}
        component={MaskedTimeInput}
        validate={validateTime}
        autoComplete="off"
        classNamePrefix={classNamePrefix}
        intl={intl}
      />

      <button type="submit">{intl.formatMessage(messages.adjust)}</button>

      <div
        role="button"
        tabIndex={0}
        onClick={openRecurrencerModal}
        onKeyPress={openRecurrencerModal}
        className={`${classNamePrefix}recurrencer-button`}
      >
        {intl.formatMessage(messages.openRecurrencerModal)}
      </div>

      {submitError && (
        <div className={`${classNamePrefix}error`}>
          {intl.formatMessage(messages[submitError.message])}
        </div>
      )}
    </form>
  );

  render() {
    const {
      initialValues,
      classNamePrefix,
      intl,
      openRecurrencerModal,
      closeModal,
    } = this.props;

    return (
      <Form
        onSubmit={this.handleSubmit}
        initialValues={initialValues}
        subscription={this.subscription}
        render={this.renderForm}
        classNamePrefix={classNamePrefix}
        intl={intl}
        openRecurrencerModal={openRecurrencerModal}
        closeModal={closeModal}
      />
    );
  }
}

export default injectIntl(EditForm, { forwardRef: true });
