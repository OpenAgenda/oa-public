import { defineMessages, useIntl } from 'react-intl';
import { Form, Field } from 'react-final-form';

const messages = defineMessages({
  evaluateOption0: {
    id: 'aggregator-sources.EvaluateOptions.evaluateOption0',
    defaultMessage: 'Aggregate only upcoming events',
  },
  evaluateOption1: {
    id: 'aggregator-sources.EvaluateOptions.evaluateOption1',
    defaultMessage: 'Aggregate all events',
  },
  evaluateOption2: {
    id: 'aggregator-sources.EvaluateOptions.evaluateOption2',
    defaultMessage: 'Aggregate current and future events',
  },
  cancel: {
    id: 'aggregator-sources.EvaluateOptions.cancel',
    defaultMessage: 'Cancel',
  },
});

const Radio = ({ id, input, children }) => (
  <label htmlFor={id}>
    <input type="radio" id={id} {...input} />
    {children}
  </label>
);

export default function EvaluateOptions({
  handleFinalSubmit,
  onClose,
  message,
  submitMessage,
}) {
  const intl = useIntl();

  return (
    <Form onSubmit={handleFinalSubmit}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="margin-v-sm">
            <p>{message}</p>

            <Field
              name="evaluate"
              type="radio"
              value="currentAndUpcoming"
              component={Radio}
              initialValue="currentAndUpcoming"
            >
              {' '}
              {intl.formatMessage(messages.evaluateOption2)}
            </Field>

            <br />

            <Field name="evaluate" type="radio" value="all" component={Radio}>
              {' '}
              {intl.formatMessage(messages.evaluateOption1)}
            </Field>

            <br />

            <Field name="evaluate" type="radio" value="null" component={Radio}>
              {' '}
              {intl.formatMessage(messages.evaluateOption0)}
            </Field>
          </div>

          <div className="pull-left">
            <button
              type="button"
              className="btn btn-link text-danger cancel-button-left"
              onClick={onClose}
            >
              {intl.formatMessage(messages.cancel)}
            </button>
          </div>
          <div className="text-right">
            <button type="submit" className="btn btn-primary">
              {submitMessage}
            </button>
          </div>
        </form>
      )}
    </Form>
  );
}
