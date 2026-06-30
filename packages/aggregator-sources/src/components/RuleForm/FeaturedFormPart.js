import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import { ReactSelectField } from '@openagenda/react-shared';
import messages from './messages.js';

export default () => {
  const intl = useIntl();

  const options = [
    {
      value: true,
      label: intl.formatMessage(messages.selected),
    },
    {
      value: false,
      label: intl.formatMessage(messages.notSelected),
    },
  ];

  return (
    <div className="row">
      <div className="form-group form-group-v-aligned">
        <div className="col-sm-10">
          <ReactSelectField
            name="featuredValue"
            Field={Field}
            placeholder={intl.formatMessage(messages.selectFeatured)}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            options={options}
            menuPosition="fixed"
          />
        </div>
      </div>
    </div>
  );
};
