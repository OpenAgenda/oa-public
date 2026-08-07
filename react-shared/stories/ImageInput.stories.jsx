import ImageInput from '../src/components/ImageInput.jsx';
import SimpleCanvas from './decorators/SimpleCanvas.jsx';

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
