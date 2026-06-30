import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import { ReactSelectField } from '@openagenda/react-shared';
import messages from './messages.js';
import Select from './Select.js';
import Radio from './Radio.js';

const ConditionalOnlineEventOptions = ({ allowOnlineEventChecked, intl }) => {
  if (!allowOnlineEventChecked) return null;

  return (
    <div className="row">
      <div className="col-sm-2" />
      <div className="col-sm-10">
        <div className="margin-left-md">
          <Field
            component={Radio}
            name="allowOnlineEventMode"
            type="radio"
            value="all"
            label={intl.formatMessage(messages.allowOnlineEventAll)}
            classNameGroup="radio filter-choice"
          />
          <Field
            component={Radio}
            name="allowOnlineEventMode"
            type="radio"
            value="strictOrWithMatchingLocation"
            label={intl.formatMessage(messages.allowOnlineEventStrict)}
            classNameGroup="radio filter-choice"
          />
        </div>
      </div>
    </div>
  );
};

export default () => {
  const intl = useIntl();

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
        <option value="adminLevel3">
          {intl.formatMessage(messages.adminLevel3)}
        </option>
        <option value="department">
          {intl.formatMessage(messages.department)}
        </option>
        <option value="region">{intl.formatMessage(messages.region)}</option>
        <option value="district">
          {intl.formatMessage(messages.district)}
        </option>
        <option value="postalCode">
          {intl.formatMessage(messages.postalCode)}
        </option>
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
              separator=","
              placeholder={intl.formatMessage(messages.addAValue)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              formatCreateLabel={(value) =>
                intl.formatMessage(messages.createOption, { value })}
              menuPosition="fixed"
              // initialValue={initialValues?.locationValues}
              isMulti
              isCreatable
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2" />
        <div className="col-sm-10">
          <Field
            component={Radio}
            name="caseSensitive"
            type="checkbox"
            label={intl.formatMessage(messages.RespectCase)}
            classNameGroup="radio filter-choice"
            helpBlock={(
              <div className="margin-h-z text-muted">
                {intl.formatMessage(messages.textFilterCaseSensitive)}
              </div>
            )}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2" />
        <div className="col-sm-10">
          <Field name="allowOnlineEvent" type="checkbox">
            {({ input, meta }) => (
              <Radio
                {...input}
                checked={!!input.value}
                onChange={(e) => input.onChange(e.target.checked)}
                type="checkbox"
                label={intl.formatMessage(messages.allowOnlineEvent)}
                classNameGroup="radio filter-choice"
                helpBlock={(
                  <div className="margin-h-z text-muted">
                    {intl.formatMessage(messages.allowOnlineEventHelp)}
                  </div>
                )}
                input={input}
                meta={meta}
              />
            )}
          </Field>
        </div>
      </div>
      <Field name="allowOnlineEvent" subscription={{ value: true }}>
        {({ input: { value: allowOnlineEventChecked } }) => (
          <>
            <ConditionalOnlineEventOptions
              allowOnlineEventChecked={allowOnlineEventChecked}
              intl={intl}
            />
            {/* Initialize allowOnlineEventMode with default value when allowOnlineEvent is checked */}
            <Field name="allowOnlineEventMode">
              {({ input }) => {
                // Set default value to 'all' if allowOnlineEvent is checked but no mode is selected
                if (allowOnlineEventChecked && !input.value) {
                  // Use setTimeout to avoid React state update warnings
                  setTimeout(() => input.onChange('all'), 0);
                }
                return null;
              }}
            </Field>
          </>
        )}
      </Field>
    </>
  );
};
