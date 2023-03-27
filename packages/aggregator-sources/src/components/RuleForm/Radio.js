import { useMemo } from 'react';

import BsField from '../BsField';

export default ({
  id,
  input,
  meta,
  label,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  disabled,
  helpBlock,
  ...props
}) => {
  const inputAttrs = useMemo(
    () => ({
      id,
      placeholder,
      className,
      spellCheck,
      autoFocus,
      disabled,
    }),
    [id, placeholder, className, spellCheck, autoFocus, disabled],
  );

  return (
    <BsField input={input} meta={meta} {...props}>
      <label htmlFor={id}>
        <input {...input} {...inputAttrs} /> {label || null}
      </label>
      {helpBlock || null}
    </BsField>
  );
};
