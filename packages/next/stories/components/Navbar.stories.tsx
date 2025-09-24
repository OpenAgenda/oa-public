import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import Navbar from 'components/Navbar';
import HelpButtonComponent from 'components/Navbar/HelpButton';
import LanguageSelectorComponent from 'components/Navbar/LanguageSelector';
import NavbarSearchInputComponent from 'components/NavbarSearchInput';
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
    <Box bg={color('azure', 500)} flex={1} colorPalette={color('mulberry')}>
      <Navbar discreet />
    </Box>
  </Box>
);

export const TransparentOnCharcoal = () => (
  <Box display="flex" flexDirection="column" height="100vh">
    <Box bg={color('charcoal', 500)} flex={1}>
      <Navbar discreet colorPalette={color('white')} logoVariant="white" />
    </Box>
  </Box>
);

export const StickyTransparentOnCharcoal = () => (
  <Box display="flex" flexDirection="column" height="200vh">
    <Navbar
      discreet
      sticky
      stickyBackground={color('charcoal', 500)}
      colorPalette={color('white')}
      logoVariant="white"
    />
    <Box bg={color('charcoal', 500)} flex={1} />
    <Box bg={color('azure', 500)} flex={1} />
    <Box bg={color('spotAliceBlue', 500)} flex={1} />
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

export const NavbarSearchInput = () => (
  <Box display="flex" flexDirection="column" height="100vh">
    <Box display="flex" flex={1} alignItems="center" justifyContent="center">
      <NavbarSearchInputComponent maxW="300px" h="50px" />
    </Box>
    <Box
      display="flex"
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={color('charcoal', 500)}
    >
      <NavbarSearchInputComponent maxW="300px" h="50px" />
    </Box>
    <Box
      display="flex"
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={color('oaWhite', 500)}
      colorPalette="strapi.mulberry"
    >
      <NavbarSearchInputComponent maxW="300px" h="50px" discreet />
    </Box>
    <Box
      display="flex"
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={color('coyote', 500)}
      colorPalette="strapi.azure"
    >
      <NavbarSearchInputComponent maxW="300px" h="50px" discreet />
    </Box>
  </Box>
);
