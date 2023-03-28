import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import messages from './messages';
import Radio from './Radio';

export default () => {
  const intl = useIntl();

  return (
    <div className="row checkbox">
      <div className="col-sm-2">
        <b>{intl.formatMessage(messages.required)}</b>
      </div>
      <div className="col-sm-10">
        <div className="form-group">
          <Field
            component={Radio}
            name="required"
            type="checkbox"
            label={intl.formatMessage(messages.requiredFilter)}
          />
        </div>
      </div>
    </div>
  );
};
