import { useState, useCallback, useContext } from 'react';
import PassCultureCheckbox from './passCulture/Checkbox';
import ComponentsContext from './components/Context';
import spreadRegistrationValuesByService from './utils/spreadRegistrationValuesByService';
import mergeSpreadRegistrationValues from './utils/mergeSpreadRegistrationValues';

const flattenLabel = (label, lang) => {
  if (!label) return label;
  return typeof label === 'string' ? label : label[lang];
};

function Registration(props) {
  const {
    onChange: propsOnChange,
    value = [],
    field: {
      placeholder,
      relatedValues = {},
      settings = {
        passCulture: null,
      },
    } = {},
    lang = 'en',
  } = props;

  const { StandardRegistrationField } = useContext(ComponentsContext);

  const {
    passCulture: passCultureValue,
    standard: standardValue,
  } = spreadRegistrationValuesByService(value);

  const [inputValue, setInputValue] = useState('');

  const appendValue = useCallback(item => {
    setInputValue('');

    propsOnChange([].concat(value ?? []).concat(item));
  }, [value, propsOnChange]);

  const onInputChange = useCallback(e => {
    const parts = e.target.value.split(/;|,|\|/);

    if (parts.length < 2) {
      setInputValue(e.target.value);
    } else {
      appendValue(parts.shift());
    }
  }, [setInputValue, appendValue]);

  const onStandardChange = useCallback(updatedValue => {
    setInputValue('');
    propsOnChange(
      mergeSpreadRegistrationValues({
        standard: updatedValue,
        passCulture: passCultureValue,
      }),
    );
  }, [propsOnChange, passCultureValue]);

  return (
    <div className="multi-input">
      {settings.passCulture ? (
        <PassCultureCheckbox
          value={passCultureValue}
          settings={settings.passCulture}
          timings={relatedValues?.timings ?? []}
          onChange={updatedPassCultureValue => propsOnChange(
            mergeSpreadRegistrationValues({
              standard: standardValue,
              passCulture: updatedPassCultureValue,
            }),
          )}
        />
      ) : null}
      <StandardRegistrationField
        value={standardValue}
        inputValue={inputValue}
        onChange={onStandardChange}
        onInputChange={onInputChange}
        placeholder={placeholder && !standardValue?.length ? flattenLabel(placeholder, lang) : undefined}
      />
    </div>
  );
}

export default Registration;

export * from './validators';
