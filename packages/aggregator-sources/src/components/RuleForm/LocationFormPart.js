import React from 'react';
import { /* useFormState, */ Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import { ReactSelectField } from '@openagenda/react-shared';
import messages from './messages';
import Select from './Select';

export default () => {
  const intl = useIntl();
  // const { initialValues } = useFormState();

  return (
    <>
      <Field
        component={Select}
        name="subdivision"
        defaultValue="city"
        label={intl.formatMessage(messages.subdivision)}
        subLabel=" "
        className="form-control"
        classNameGroup="form-group form-inline"
      >
        <option value="city">{intl.formatMessage(messages.city)}</option>
        <option value="department">
          {intl.formatMessage(messages.department)}
        </option>
        <option value="region">{intl.formatMessage(messages.region)}</option>
        <option value="name">{intl.formatMessage(messages.name)}</option>
      </Field>

      <div className="row">
        <div className="form-group form-group-v-aligned">
          <label className="control-label col-sm-2" htmlFor="locationValues">
            {intl.formatMessage(messages.values)}
          </label>

          <div className="col-sm-10">
            <ReactSelectField
              name="locationValues"
              Field={Field}
              placeholder={intl.formatMessage(messages.addAValue)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              formatCreateLabel={value => intl.formatMessage(messages.createOption, { value })}
              menuPosition="fixed"
              // initialValue={initialValues?.locationValues}
              isMulti
              isCreatable
            />
          </div>
        </div>
      </div>
    </>
  );
};
