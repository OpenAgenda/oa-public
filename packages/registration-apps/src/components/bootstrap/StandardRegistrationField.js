import TagsInput from 'react-tagsinput';

import getItemAttributes from '../../utils/getRegistrationItemAttributes.js';

function RegistrationItem({ key, tag, onRemove, className }) {
  const tagValue = tag instanceof Object ? tag.value : tag;
  const { type, icon } = getItemAttributes(tag);

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

export default function StandardRegistrationField({
  value,
  inputValue,
  onChange,
  onInputChange,
  placeholder,
  infoLabel,
  enabled,
}) {
  return (
    <div className="multi-input">
      <div className="margin-bottom-xs">{infoLabel}</div>
      <TagsInput
        onChange={onChange}
        renderTag={RegistrationItem}
        value={value ?? []}
        onlyUnique
        addOnBlur
        disabled={!enabled}
        inputProps={{
          value: inputValue,
          onChange: onInputChange,
          placeholder,
          style: !value?.length ? { width: '630px' } : null,
        }}
      />
    </div>
  );
}
