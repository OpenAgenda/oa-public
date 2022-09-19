import {
  ChakraProvider,
  theme
} from '@openagenda/uikit';

import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return <ChakraProvider theme={theme}>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </ChakraProvider>
}
