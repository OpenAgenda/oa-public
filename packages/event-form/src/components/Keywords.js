import { useState } from 'react';
import TagsInput from 'react-tagsinput';

const KeywordsComponent = ({
  field,
  value = [],
  onChange,
}) => {
  const [inputValues, setInputValues] = useState(null);

  const myOnChange = v => {
    setInputValues();
    onChange([...new Set(v)]); // only push uniq tags
  };

  const onInputChange = e => {
    const parts = e.target.value.split(',');
    if (parts.length === 2) {
      if (parts[0].length >= 1) {
        value.push(parts[0]);
        myOnChange(value);
      }
      setInputValues();
      return;
    }
    setInputValues(e.target.value);
  };

  return (
    <div className="multi-input">
      <div>
        <TagsInput
          value={value}
          onChange={v => myOnChange(v)}
          inputProps={{
            value: inputValues || '',
            onChange: e => onInputChange(e),
            placeholder: field.placeholder,
            onBlur: e => {
              if (!e.target.value.length) return;
              setInputValues();
              value.push(e.target.value);
              myOnChange(value);
            },
            style: value ? { width: '630px' } : null,
          }}
        />
      </div>
    </div>
  );
};

export default KeywordsComponent;
