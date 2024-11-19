import ImageInput from '../src/components/ImageInput.js';
import SimpleCanvas from './decorators/SimpleCanvas.js';

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
