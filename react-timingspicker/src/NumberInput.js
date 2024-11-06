import MaskedInputModule from 'react-text-mask';

const MaskedInput = MaskedInputModule || MaskedInputModule;

export default function NumberInput({ input, meta, mask, ...rest }) {
  return <MaskedInput {...input} {...rest} mask={mask} />;
}
