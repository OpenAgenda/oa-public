import TagsInput from 'react-tagsinput';

import getItemAttributes from '../../utils/getRegistrationItemAttributes';

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

export default function StandardRegistrationField({
  value,
  inputValue,
  onChange,
  onInputChange,
  placeholder,
}) {
  return (
    <TagsInput
      onChange={onChange}
      renderTag={RegistrationItem}
      value={value ?? []}
      onlyUnique
      addOnBlur
      inputProps={{
        value: inputValue,
        onChange: onInputChange,
        placeholder,
        style: !value?.length ? { width: '630px' } : null,
      }}
    />
  );
}
