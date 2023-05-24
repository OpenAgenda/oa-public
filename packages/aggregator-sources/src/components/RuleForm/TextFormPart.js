import { useIntl } from 'react-intl';
import { Field, useForm } from 'react-final-form';

import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
import formLabels from '@openagenda/labels/event/form';
import { getLocaleValue } from '@openagenda/intl';
import stringType from '../../utils/stringType';
import messages from './messages';
import Radio from './Radio';

const eventFields = [
  'title',
  'description',
  'longDescription',
  'keywords',
  'conditions',
].map(field => ({
  field,
  label: formLabels[field],
}));

export default ({ sourceSchema = { fields: [] } }) => {
  const intl = useIntl();
  const form = useForm();

  const { values /* , initialValues */ } = form.getState();

  const options = useMemoOne(
    () =>
      sourceSchema.fields
        .filter(v => stringType.includes(v.fieldType))
        .concat(eventFields)
        .map(({ field, label }) => ({
          value: field,
          label: getLocaleValue(label, intl.locale)
            ? getLocaleValue(label, intl.locale)
            : field,
        })),
    [intl.locale, sourceSchema.fields],
  );

  return (
    <>
      <div className="row">
        <div className="form-group form-group-v-aligned">
          <label className="control-label col-sm-2" htmlFor="textField">
            {intl.formatMessage(messages.field)}
          </label>

          <div className="col-sm-10">
            <ReactSelectField
              name="textField"
              Field={Field}
              placeholder={intl.formatMessage(messages.selectField)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={options}
              menuPosition="fixed"
              isSearchable
              // initialValue={initialValues?.textField}
            />
          </div>
        </div>
      </div>

      {values.textField ? (
        <Field
          name="textValue"
          render={({ input }) => (
            <div className="row">
              <div className="form-group form-group-v-aligned">
                <label className="control-label col-sm-2" htmlFor="textValue">
                  {intl.formatMessage(messages.value)}
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control"
                    {...input}
                    placeholder={intl.formatMessage(messages.substring)}
                  />
                </div>
              </div>
            </div>
          )}
        />
      ) : null}
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
        <div className="col-sm-2" />
        <div className="col-sm-10">
          <Field
            component={Radio}
            name="wholeValue"
            type="checkbox"
            label={intl.formatMessage(messages.wholeValueFilter)}
            classNameGroup="radio filter-choice"
          />
        </div>
      </div>
    </>
  );
};
