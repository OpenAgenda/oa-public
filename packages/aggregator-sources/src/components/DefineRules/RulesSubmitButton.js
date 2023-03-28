import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  cancel: {
    id: 'aggregator-sources.AggregatorRulesModal.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'aggregator-sources.AggregatorRulesModal.save',
    defaultMessage: 'Save',
  },
  next: {
    id: 'aggregator-sources.AggregatorRulesModal.next',
    defaultMessage: 'Next',
  },
});

export default options =>
  ({ handleSubmit, onCancel }) => {
    const buttonLabel = (options || {}).primary || 'save';
    const intl = useIntl();

    return (
      <div className="margin-top-md">
        <div className="pull-left">
          <button
            type="button"
            className="btn btn-link text-danger cancel-button-left"
            onClick={onCancel}
          >
            {intl.formatMessage(messages.cancel)}
          </button>
        </div>
        <div className="text-right">
          <button
            onClick={handleSubmit}
            type="button"
            className="btn btn-primary"
          >
            {intl.formatMessage(messages[buttonLabel])}
          </button>
        </div>
      </div>
    );
  };
