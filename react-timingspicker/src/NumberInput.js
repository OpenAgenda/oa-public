import React from 'react';
import MaskedInput from 'react-text-mask';

export default function NumberInput({
  input, meta, mask, ...rest
}) {
  return <MaskedInput {...input} {...rest} mask={mask} />;
}
