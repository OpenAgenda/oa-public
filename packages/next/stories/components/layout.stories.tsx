import { UIKitProvider } from '@openagenda/uikit';
import Layout from 'components/Layout';

export default {
  title: 'Layout',
  component: Layout,
};

export function SimpleLayout() {
  return (
    <UIKitProvider>
      <Layout>Sample content</Layout>
    </UIKitProvider>
  );
}
