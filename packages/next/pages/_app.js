import {
  ChakraProvider,
  theme
} from '@openagenda/uikit';

export default function App({ Component, pageProps }) {
  return <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
}
