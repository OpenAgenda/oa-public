import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useForm, Field } from 'react-final-form';
import { ReactSelectField } from '@openagenda/react-shared';
import messages from './messages.js';

export default ({
  name,
  action,
  fieldSchema,
  textFieldCopyOptions,
  advancedMode,
  advanceModeSetField,
}) => {
  const intl = useIntl();
  const form = useForm();

  const [textFieldMode, setTextFieldMode] = useState(
    action?.values?.$copy ? 'copy' : 'set',
  );

  return (
    <>
      <div className="form-inline margin-bottom-xs">
        <label
          className="radio-inline"
          htmlFor="text-radio-set"
          title={intl.formatMessage(messages.setTextTitle)}
        >
          <input
            type="radio"
            id="text-radio-set"
            onClick={() => setTextFieldMode('set')}
            checked={textFieldMode === 'set'}
          />
          {intl.formatMessage(messages.setTextValue)}
        </label>
        <label
          className="radio-inline"
          htmlFor="text-radio-copy"
          title={intl.formatMessage(messages.copyTextTitle)}
        >
          <input
            type="radio"
            id="text-radio-copy"
            onClick={() => setTextFieldMode('copy')}
            checked={textFieldMode === 'copy'}
          />
          {intl.formatMessage(messages.copyTextValue)}
        </label>
      </div>
      {textFieldMode === 'set' ? (
        <>
          <div className="text-muted margin-bottom-sm">
            {intl.formatMessage(messages.setTextTitle)}
          </div>
          <Field
            key={`${name}-values-${action.field}`}
            name={`${name}.values`}
            render={({ input }) => (
              <div className="row">
                <div className="form-group form-group-v-aligned">
                  <div className="col-sm-12">
                    <input
                      type="text"
                      className="form-control"
                      {...input}
                      placeholder={intl.formatMessage(
                        messages[`${fieldSchema.fieldType}Placeholder`],
                      )}
                      onChange={(e) => {
                        form.batch(() => {
                          form.change(`${name}.values`, e.target.value);
                          form.change(`${name}.copyValues`, undefined);
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </>
      ) : null}
      {textFieldMode === 'copy' ? (
        <>
          <div className="text-muted margin-bottom-sm">
            {intl.formatMessage(messages.copyTextTitle)}
          </div>
          <div className="margin-bottom-md">
            <ReactSelectField
              key={`${name}-copyValues-${action.field}`}
              Field={Field}
              name={`${name}.copyValues`}
              placeholder={intl.formatMessage(messages.copyTextPlaceholder)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={textFieldCopyOptions}
              menuPosition="fixed"
              isDisabled={action?.automatic}
              isSearchable
              onChange={(e) => {
                form.batch(() => {
                  form.change(`${name}.values`, undefined);
                  form.change(`${name}.copyValues`, e.value);
                });
              }}
            />
          </div>
        </>
      ) : null}

      {advancedMode ? advanceModeSetField : null}
    </>
  );
};
