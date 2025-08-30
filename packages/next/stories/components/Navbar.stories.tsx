import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import Navbar from 'components/Navbar';
import HelpButtonComponent from 'components/Navbar/HelpButton';
import LanguageSelectorComponent from 'components/Navbar/LanguageSelector';
import { color } from 'utils/strapi';
import fetchAllLocales from '../utils/fetchAllLocales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import userFixtures from './fixtures/user.json';

export default {
  title: 'components/Navbar',
  component: Navbar,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

export const NotConnected = () => <Navbar />;

export const Connected = {
  render: () => <Navbar />,
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};

export const Transparent = () => (
  <Box display="flex" flexDirection="column" height="100vh">
    <Box bg={color('azure', 500)} flex={1}>
      <Navbar discreet fontColor={color('mulberry')} />
    </Box>
    <Box bg={color('charcoal', 500)} flex={1}>
      <Navbar discreet fontColor={color('azure')} logoVariant="white" />
    </Box>
    <Box bg={color('charcoal', 500)} flex={1}>
      <Navbar discreet fontColor={color('oaWhite')} logoVariant="white" />
    </Box>
  </Box>
);

export const HelpButton = () => (
  <Box display="flex" flexDirection="column" height="100vh">
    <Box
      bg={color('charcoal', 500)}
      flex={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      colorPalette="strapi.azure"
    >
      <HelpButtonComponent />
    </Box>
    <Box display="flex" flex={1} alignItems="center" justifyContent="center">
      <HelpButtonComponent />
    </Box>
    <Box
      display="flex"
      bg="strapi.vanilla.200"
      flex={1}
      alignItems="center"
      justifyContent="center"
      colorPalette="strapi.mulberry"
    >
      <HelpButtonComponent />
    </Box>
    <Box
      display="flex"
      bg="black"
      flex={1}
      alignItems="center"
      justifyContent="center"
      colorPalette="white"
    >
      <HelpButtonComponent />
    </Box>
  </Box>
);

export const LanguageSelector = () => (
  <>
    <Box
      bg={color('charcoal', 500)}
      minH="30vh"
      pt="4"
      colorPalette="strapi.azure"
    >
      <LanguageSelectorComponent />
    </Box>
    <Box minH="30vh" pt="4" colorPalette="oaGray">
      <LanguageSelectorComponent />
    </Box>
    <Box pt="4" minH="30vh" colorPalette="strapi.mulberry">
      <LanguageSelectorComponent />
    </Box>
  </>
);
