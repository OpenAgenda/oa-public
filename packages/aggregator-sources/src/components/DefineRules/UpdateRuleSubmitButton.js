import { useIntl } from 'react-intl';
import messages from './messages';

export default function UpdateRuleSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();

  return (
    <div>
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
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.update)}
        </button>
      </div>
    </div>
  );
}
