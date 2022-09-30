import { ChakraProvider, theme } from '@openagenda/uikit';
import Layout from '../../../components/Layout';

export default {
  title: 'Layout',
  component: Layout,
};

export function SimpleLayout() {
  return (
    <ChakraProvider theme={theme}>
      <Layout>Sample content</Layout>
    </ChakraProvider>
  );
}
