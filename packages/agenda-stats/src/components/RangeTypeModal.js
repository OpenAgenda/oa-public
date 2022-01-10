import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Field, Form } from 'react-final-form';
import { Modal, Spinner } from '@openagenda/react-shared';

const messages = defineMessages({
  modalTitle: {
    id: 'AgendaStats.RangeTypeModal.modalTitle',
    defaultMessage: 'Choose type of period range',
  },
});

const Radio = ({ id, input, children }) => (
  <label htmlFor={id}>
    <input type="radio" id={id} {...input} />
    {children}
  </label>
);

function RangeTypeForm({
  range, handleSubmit, onClose, submitting
}) {
  return (
    <form onSubmit={handleSubmit}>
      <div className="margin-v-sm">
        <p>
          <FormattedMessage
            id="AgendaStats.RangeTypeModal.rangeTypeDesc"
            defaultMessage="The period from <b>{startDate, date}</b> to <b>{endDate, date}</b> applies to:"
            values={{
              b: txt => <b>{txt}</b>,
              startDate: range.startDate,
              endDate: range.endDate,
            }}
          />
        </p>

        <Field name="rangeType" type="radio" value="date" component={Radio}>
          {' '}
          <FormattedMessage
            id="AgendaStats.RangeTypeModal.dateDesc"
            defaultMessage="the event timings"
          />
        </Field>

        <br />

        <Field
          name="rangeType"
          type="radio"
          value="createdAt"
          component={Radio}
        >
          {' '}
          <FormattedMessage
            id="AgendaStats.RangeTypeModal.createdAtDesc"
            defaultMessage="the creation date of the events"
          />
        </Field>
      </div>

      <div className="text-center margin-top-md">
        <button
          type="button"
          className="btn btn-danger btn-bordered"
          onClick={onClose}
        >
          <FormattedMessage
            id="AgendaStats.RangeTypeModal.cancel"
            defaultMessage="Cancel"
          />
        </button>
        <button
          type="button"
          className="btn btn-primary margin-left-sm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <FormattedMessage
            id="AgendaStats.RangeTypeModal.submit"
            defaultMessage="Submit"
          />

          {submitting ? (
            <span className="margin-left-xs">
              <Spinner mode="inline" />
            </span>
          ) : null}
        </button>
      </div>
    </form>
  );
}

export default function RangeTypeModal({
  range,
  initialValues,
  onSubmit,
  onClose,
}) {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big',
      }}
      disableBodyScroll
    >
      <Form
        component={RangeTypeForm}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onClose={onClose}
        range={range}
      />
    </Modal>
  );
}
