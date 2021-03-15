import React from 'react';
import MaskedInput from 'react-text-mask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import deriveDateFormat from './utils/deriveDateFormat';

export default function DateInput({
  input,
  meta,
  label,
  classNamePrefix,
  intl,
  ...rest
}) {
  const derivedDateFormat = deriveDateFormat(intl)
    .split('')
    .map(v => {
      // Reverse MM and mm for text-mask (see https://github.com/text-mask/text-mask/issues/951)
      switch (v) {
        case 'M':
          return 'm';
        case 'm':
          return 'M';
        default:
          return v;
      }
    })
    .join('');

  const pipe = createAutoCorrectedDatePipe(derivedDateFormat);
  const mask = derivedDateFormat
    .split('')
    .map(char => (/[a-z]/gi.test(char) ? /\d/ : char));

  return (
    <section className={`${classNamePrefix}section`}>
      {label ? <div>{label}</div> : null}

      <MaskedInput
        {...input}
        {...rest}
        mask={mask}
        pipe={pipe}
        keepCharPositions
        className={`${classNamePrefix}input`}
      />

      {meta.touched && meta.error ? (
        <div className={`${classNamePrefix}input-error`}>{meta.error}</div>
      ) : null}
    </section>
  );
}
