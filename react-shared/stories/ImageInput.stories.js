import ImageInput from '../src/components/ImageInput';
import SimpleCanvas from './decorators/SimpleCanvas';

export default {
  title: 'ImageInput',
  component: ImageInput,
  decorators: [SimpleCanvas],
};

export const Default = () => (
  <ImageInput
    locale="fr"
    label="Label de l'image"
    input={{
      onChange: () => {},
      value: undefined,
    }}
  />
);
