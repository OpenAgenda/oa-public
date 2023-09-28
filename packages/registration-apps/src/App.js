import { useState, useCallback, useContext } from 'react';
import PassCultureCheckbox from './passCulture/Checkbox';

import {
  updateValue,
  getNormalizedValue,
} from './utils';

import ComponentsContext from './components/Context';

const dedupe = items => items.reduce(
  (deduped, item) => (deduped.includes(item) ? deduped : deduped.concat(item)),
  [],
);

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

  const normalizedValue = getNormalizedValue(value, settings);

  const { StandardRegistrationField } = useContext(ComponentsContext);

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
      updateValue(value, {
        links: dedupe([].concat(updatedValue)),
      }, settings),
    );
  }, [propsOnChange, settings, value]);

  return (
    <div className="multi-input">
      {settings.passCulture ? (
        <PassCultureCheckbox
          value={normalizedValue.passCulture}
          settings={settings.passCulture}
          timings={relatedValues?.timings ?? []}
          onChange={passValue => propsOnChange(
            updateValue(value, {
              passCulture: passValue,
            }, settings),
          )}
        />
      ) : null}
      <StandardRegistrationField
        value={normalizedValue.links}
        inputValue={inputValue}
        onChange={onStandardChange}
        onInputChange={onInputChange}
        placeholder={placeholder && !value?.length ? flattenLabel(placeholder, lang) : undefined}
      />
    </div>
  );
}

export default Registration;

export * from './validators';
