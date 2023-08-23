import Providers from 'Providers';
import Layout from 'components/Layout';
import fetchAllLocales from '../utils/fetchAllLocales';

export default {
  title: 'components/Layout',
  component: Layout,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
    }),
  ],
};

export function SimpleLayout(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Layout>Sample content</Layout>
    </Providers>
  );
}
