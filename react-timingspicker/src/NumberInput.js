import MaskedInputModule from 'react-text-mask';

const MaskedInput = MaskedInputModule.default || MaskedInputModule;

export default function NumberInput({ input, meta, mask, ...rest }) {
  return <MaskedInput {...input} {...rest} mask={mask} />;
}
