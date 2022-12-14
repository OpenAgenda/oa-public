import { useIntl } from 'react-intl';
import { /* useFormState, */ Field } from 'react-final-form';

import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import messages from './messages';

export default ({ schema }) => {
  const intl = useIntl();
  // const { initialValues } = useFormState();

  const options = useMemoOne(
    () =>
      (schema
        ? schema.fields
          .filter(v => ['radio', 'checkbox'].includes(v.fieldType))
          .map(({ options: fieldOptions }) => fieldOptions)
          .flat()
          .map(v => ({
            value: v.label,
            label: getLocaleValue(v.label, intl.locale),
          }))
        : []),
    [schema],
  );

  return (
    <div className="row">
      <div className="form-group form-group-v-aligned">
        <label className="control-label col-sm-2" htmlFor="tagValues">
          {intl.formatMessage(messages.values)}
        </label>

        <div className="col-sm-10">
          <ReactSelectField
            name="tagValues"
            Field={Field}
            // initialValue={initialValues?.tagValues}
            placeholder={intl.formatMessage(messages.addAValue)}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            formatCreateLabel={value =>
              intl.formatMessage(messages.createOption, { value })}
            options={options}
            menuPosition="fixed"
            isMulti
            isCreatable
          />
        </div>
      </div>
    </div>
  );
};
