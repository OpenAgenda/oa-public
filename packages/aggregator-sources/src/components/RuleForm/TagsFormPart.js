import React from 'react';
import { useIntl } from 'react-intl';
import { useFormState } from 'react-final-form';

import { useMemoOne } from '@openagenda/react-shared';

import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';

import SelectField from './SelectField';
import messages from './messages';

export default ({ schema }) => {
  const intl = useIntl();
  const { initialValues } = useFormState();

  const options = useMemoOne(
    () => (schema
      ? schema.fields
        .filter(v => ['radio', 'checkbox'].includes(v.fieldType))
        .map(({ options: fieldOptions }) => fieldOptions)
        .flat()
        .map(v => ({
          value: v.label,
          label: getMultiLanguageLabel(v.label)
        }))
      : []),
    [schema]
  );

  return (
    <div className="row">
      <div className="form-group form-group-v-aligned">
        <label className="control-label col-sm-2" htmlFor="tagValues">
          {intl.formatMessage(messages.values)}
        </label>

        <div className="col-sm-10">
          <SelectField
            name="tagValues"
            initialValue={initialValues?.tagValues}
            placeholder={intl.formatMessage(messages.addAValue)}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            options={options}
            menuPosition="fixed"
            isMulti
            creatable
          />
        </div>
      </div>
    </div>
  );
};
