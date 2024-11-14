import BootstrapComponentsProvider from '../../src/components/bootstrap/Provider.js';

export default (Story) => (
  <BootstrapComponentsProvider>
    <Story />
  </BootstrapComponentsProvider>
);
