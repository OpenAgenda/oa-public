import { UIKitProvider } from '@openagenda/uikit';
import Layout from 'components/Layout';

const head = {
  title: 'Layout',
  component: Layout,
};

export default head;

export function SimpleLayout() {
  return (
    <UIKitProvider>
      <Layout>Sample content</Layout>
    </UIKitProvider>
  );
}
