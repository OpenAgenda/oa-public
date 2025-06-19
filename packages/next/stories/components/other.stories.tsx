import CopyIdentifierComponent from 'components/CopyIdentifier';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'components/Other',
  decorators: [ProvidersDecorator],
};

export const CopyIdentifier = () => {
  return <CopyIdentifierComponent identifier={12345678} />;
};
