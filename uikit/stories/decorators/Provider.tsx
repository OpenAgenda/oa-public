import { UIKitProvider } from '../../src';

export default (Story: React.ElementType) => (
  <UIKitProvider>
    <Story />
  </UIKitProvider>
);
