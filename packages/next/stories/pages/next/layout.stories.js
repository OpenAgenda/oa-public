import Layout from '../../../components/Layout';
import {
  ChakraProvider,
  theme
} from '@openagenda/uikit';

export default {
  title: 'Layout',
  component: Layout
}

export const SimpleLayout = () => (
  <ChakraProvider theme={theme}>
    <Layout>
      Sample content
    </Layout>
  </ChakraProvider>
);
