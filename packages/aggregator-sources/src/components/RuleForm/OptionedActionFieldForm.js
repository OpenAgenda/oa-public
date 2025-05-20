import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';
import { ReactSelectField } from '@openagenda/react-shared';
import isOptionedField from '../../utils/isOptionedField.js';
import messages from './messages.js';
import Radio from './Radio.js';

export default ({
  name,
  action,
  fieldSchema,
  valuesOptions,
  advancedMode,
  initialAction,
  advanceModeSetField,
}) => {
  const intl = useIntl();

  return (
    <>
      <ReactSelectField
        key={`${name}-values-${action.field}`}
        Field={Field}
        name={`${name}.values`}
        placeholder={intl.formatMessage(
          messages[
            action?.automatic ? 'selectValueAutomaticMode' : 'selectValue'
          ],
        )}
        noOptionsMessage={() => intl.formatMessage(messages.noOption)}
        options={valuesOptions}
        menuPosition="fixed"
        isMulti={isOptionedField.multi(fieldSchema)}
        isDisabled={action?.automatic}
        isSearchable
      />
      {advancedMode ? (
        <>
          <Field
            key="automatic"
            component={Radio}
            name={`${name}.automatic`}
            initialValue={initialAction?.automatic}
            type="checkbox"
            label={intl.formatMessage(messages.automaticAssignment)}
            classNameGroup="checkbox"
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.automaticDescription)}
              </div>
            )}
          />
          {advanceModeSetField}
        </>
      ) : null}
    </>
  );
};
