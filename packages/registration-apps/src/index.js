import { useState, useCallback } from 'react';
import TagsInput from 'react-tagsinput';

import getItemAttributes from './utils/getRegistrationItemAttributes';

const dedupe = items => items.reduce(
  (deduped, item) => (deduped.includes(item) ? deduped : deduped.concat(item)),
  [],
);

const flattenLabel = (label, lang) => {
  if (!label) return label;
  return typeof label === 'string' ? label : label[lang];
};

function RegistrationItem({ key, tag, onRemove, className }) {
  const tagValue = tag instanceof Object ? tag.value : tag;
  const { type, icon } = getItemAttributes(tagValue);

  return (
    <button
      type="button"
      key={key}
      className={`${className} ${type === 'error' ? 'error' : ''}`}
      onClick={() => onRemove(key)}
    >
      <i className={icon} />
      {tagValue}
      <strong>×</strong>
    </button>
  );
}

function Registration(props) {
  const {
    onChange: propsOnChange,
    value = [],
    field: {
      placeholder,
    } = {},
    lang = 'en',
  } = props;

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

  const onChange = useCallback(updatedValue => {
    setInputValue('');
    propsOnChange(dedupe([].concat(updatedValue)));
  }, [propsOnChange]);

  return (
    <div className="multi-input">
      <TagsInput
        onChange={onChange}
        renderTag={RegistrationItem}
        value={value ?? []}
        onlyUnique
        addOnBlur
        inputProps={{
          value: inputValue,
          onChange: onInputChange,
          placeholder: placeholder && !value?.length ? flattenLabel(placeholder, lang) : undefined,
          style: !value?.length ? { width: '630px' } : null,
        }}
      />
    </div>
  );
}

export default Registration;

export * from './validators';
