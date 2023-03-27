import { useMemo } from 'react';

import BsField from '../BsField';

export default ({
  input,
  meta,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  children,
  ...props
}) => {
  const inputAttrs = useMemo(
    () => ({
      placeholder,
      className,
      spellCheck,
      autoFocus,
    }),
    [placeholder, className, spellCheck, autoFocus],
  );

  return (
    <BsField input={input} meta={meta} {...props}>
      <select {...input} {...inputAttrs}>
        {children}
      </select>

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </BsField>
  );
};
