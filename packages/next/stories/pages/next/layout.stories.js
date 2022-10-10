import { ChakraProvider, theme } from '@openagenda/uikit';
import Layout from '../../../src/components/Layout';

const head = {
  title: 'Layout',
  component: Layout,
};

export default head;

export function SimpleLayout() {
  return (
    <ChakraProvider theme={theme}>
      <Layout>Sample content</Layout>
    </ChakraProvider>
  );
}
