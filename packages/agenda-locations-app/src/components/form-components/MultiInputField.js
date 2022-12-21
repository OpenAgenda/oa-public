import { useState } from 'react';
import TagsInput from 'react-tagsinput';

const MultiInputField = ({
  value,
  name = 'mutli_input',
  validator,
  enabled = true,
  typeIconClassNames = {
    link: 'fa fa-link',
    phone: 'fa fa-phone',
    email: 'fa fa-envelope',
    error: 'fa fa-exclamation-circle',
  },
  getLabel,
  onChange,
  info,
}) => {
  const decorate = v => validator.decorate(v);
  const values = decorate(value || []);
  const error = !!values.filter(v => !!v.errors).length;
  const [inputValue, setInputValue] = useState('');

  const myOnChange = v => {
    if (!enabled) return;
    setInputValue('');
    onChange(name, v.map(decoratedItem => (typeof decoratedItem === 'string' ? decoratedItem : decoratedItem.value)));
  };

  const onBlur = () => {
    if (!enabled) return;
    const tmpValue = inputValue;
    if (!tmpValue.length) return;
    myOnChange(decorate(value || []).concat(tmpValue));
  };

  const onInputChange = v => {
    let targetValue = v.target.value;
    if (targetValue.indexOf(',') !== -1) {
      myOnChange(decorate((value || []).concat(targetValue.split(',')[0])));
      const { res } = targetValue.split(',')[1];
      targetValue = res;
    }
    setInputValue(targetValue);
  };

  const renderItem = t => {
    if (t.tag.errors) t.className += ' error';
    return (
      <span key={t.key} className={t.className}>
        <i className={typeIconClassNames[t.tag.type || 'error']} />
        {t.tag.value}
        <a onClick={t.onRemove.bind(null, t.key)} />  {/* eslint-disable-line*/}
      </span>
    );
  };

  return (
    <div className={enabled ? 'multi-input' : 'multi-input disabled'}>
      <label htmlFor={name}>{getLabel(name) }</label>
      {info && getLabel(info)
        ? <div>{getLabel(info)}</div>
        : null}
      <TagsInput
        value={values}
        renderTag={renderItem}
        onChange={myOnChange}
        inputProps={{
          placeholder: null,
          onBlur,
          onChange: onInputChange,
          value: inputValue,
          disabled: !enabled,
        }}
      />
      <span className={error ? 'error' : 'info'}>{ error ? getLabel('multi-input.error') : getLabel('multi-input.info')}</span>
    </div>
  );
};

export default MultiInputField;
