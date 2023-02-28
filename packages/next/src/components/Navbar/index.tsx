import { ParsedUrlQuery } from 'querystring';
import qs from 'qs';
import { useCallback, useRef } from 'react';
import ContentLoader from 'react-content-loader';
import { defineMessages, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/pro-solid-svg-icons';
import {
  Box,
  Button,
  Container,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Collapse,
  Divider,
  Portal,
  useDisclosure,
  useToken,
} from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/SearchInput';
import Image from 'components/Image';
import keyCDNLoader from 'utils/keyCDNLoader';
import logoPic from '../../../public/images/openagenda.png';

const messages = defineMessages({
  signIn: {
    id: 'next.components.Navbar.signIn',
    defaultMessage: 'Sign in',
  },
  signUp: {
    id: 'next.components.Navbar.signUp',
    defaultMessage: 'Sign up',
  },
  myAgendas: {
    id: 'next.components.Navbar.myAgendas',
    defaultMessage: 'My agendas',
  },
  myEvents: {
    id: 'next.components.Navbar.myEvents',
    defaultMessage: 'My events',
  },
  settings: {
    id: 'next.components.Navbar.settings',
    defaultMessage: 'Settings',
  },
  signOut: {
    id: 'next.components.Navbar.signOut',
    defaultMessage: 'Sign out',
  },
  profileMenu: {
    id: 'next.components.Navbar.profileMenu',
    defaultMessage: 'Profile menu',
  },
});

function ProfileLoader(props) {
  const [oaGray100, oaGray200] = useToken('colors', ['oaGray.100', 'oaGray.200']);

  return (
    <ContentLoader
      uniqueKey="profile"
      speed={2}
      width={140}
      height={40}
      viewBox="0 0 140 40"
      backgroundColor={oaGray100}
      foregroundColor={oaGray200}
      {...props}
    >
      <circle cx="20" cy="20" r="14" />
      <circle cx="70" cy="20" r="14" />
      <circle cx="120" cy="20" r="14" />
    </ContentLoader>
  );
}

function ProfileMenu({ user, portalRef }) {
  const intl = useIntl();

  const collapseId = 'header-menu-collapse';
  const { getButtonProps, isOpen } = useDisclosure({ id: collapseId });

  const onSearch = useCallback(e => {
    e.preventDefault();
    const query = Object.fromEntries(new FormData(e.currentTarget).entries()) as ParsedUrlQuery;
    window.location.assign(`/agendas?${qs.stringify(query)}`);
  }, []);

  const button = user.image ? (
    <Image
      alt={intl.formatMessage(messages.profileMenu)}
      src={process.env.NODE_ENV === 'development'
        ? `${process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX}${user.image}`
        : `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}${user.image}`}
      fallbackSrc={process.env.NODE_ENV === 'development'
        ? `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}${user.image}`
        : undefined}
      fallbackStrategy="onError"
      loader={keyCDNLoader}
      width="30"
      height="30"
    />
  ) : user.fullName;

  return (
    <>
      {/* Desktop content */}
      <Menu placement="bottom-end" colorScheme="primary">
        {/* TODO `p={4} py={0}` -> `px={4}` after https://github.com/chakra-ui/chakra-ui/pull/6905 */}
        <MenuButton
          as={Button}
          variant="link"
          display={{ base: 'none', lg: 'flex' }}
          p="4"
          py="0"
          height="full" // h doesn't works here: https://github.com/chakra-ui/chakra-ui/issues/7136
          sx={{
            // The span surrounding the image is larger than the image without this
            span: {
              display: 'inline-flex',
            },
          }}
        >
          {button}
        </MenuButton>
        <MenuList
          // https://github.com/chakra-ui/chakra-ui/issues/5742
          zIndex="5"
        >
          <MenuItem as={Link} href="/home" textAlign="right">
            {intl.formatMessage(messages.myAgendas)}
          </MenuItem>
          <MenuItem as={Link} href="/home/events" textAlign="right">
            {intl.formatMessage(messages.myEvents)}
          </MenuItem>
          <MenuDivider />
          <MenuItem as={Link} href="/settings" textAlign="right">
            {intl.formatMessage(messages.settings)}
          </MenuItem>
          <MenuItem as={Link} href="/signout" textAlign="right">
            {intl.formatMessage(messages.signOut)}
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Mobile content */}
      <IconButton
        aria-label="Open Menu"
        size="md"
        variant="ghost"
        mr="4"
        icon={<FontAwesomeIcon icon={faBars} />}
        display={{ base: 'flex', lg: 'none' }}
        {...getButtonProps()}
      />
      <Portal containerRef={portalRef}>
        <Collapse id={collapseId} in={isOpen}>
          <Box display={{ base: 'block', lg: 'none' }}>
            <form onSubmit={onSearch}>
              <SearchInput h="50px" maxW="full" />
            </form>

            <Box py="2">
              <Link
                href="/home"
                display="block"
                px="6"
                py="3"
                _hover={{ bg: 'primary.50', textDecoration: 'underline' }}
              >
                {intl.formatMessage(messages.myAgendas)}
              </Link>
              <Link
                href="/home/events"
                display="block"
                px="6"
                py="3"
                _hover={{ bg: 'primary.50', textDecoration: 'underline' }}
              >
                {intl.formatMessage(messages.myEvents)}
              </Link>
              <Divider my="2" />
              <Link
                href="/settings"
                display="block"
                px="6"
                py="3"
                _hover={{ bg: 'primary.50', textDecoration: 'underline' }}
              >
                {intl.formatMessage(messages.settings)}
              </Link>
              <Link
                href="/signout"
                display="block"
                px="6"
                py="3"
                _hover={{ bg: 'primary.50', textDecoration: 'underline' }}
              >
                {intl.formatMessage(messages.signOut)}
              </Link>
            </Box>
          </Box>
        </Collapse>
      </Portal>
    </>
  );
}

function ProfileBar({ portalRef }) {
  const intl = useIntl();
  const { user, status } = useUser();

  if (status === FetchStatus.Fetching) {
    return <ProfileLoader />;
  }

  // TODO error?.response?.status != 401 THEN toast error

  // Authenticated
  if (user) {
    return (
      <ProfileMenu portalRef={portalRef} user={user} />
    );
  }

  // Not authenticated
  return (
    <Flex direction="row" h="full">
      <Button
        as={Link}
        href="/signin"
        variant="link"
        colorScheme="primary"
        height="full" // h doesn't works here: https://github.com/chakra-ui/chakra-ui/issues/7136
        px="4"
      >
        {intl.formatMessage(messages.signIn)}
      </Button>
      <Button
        as={Link}
        href="/signup"
        variant="link"
        colorScheme="primary"
        height="full" // h doesn't works here: https://github.com/chakra-ui/chakra-ui/issues/7136
        px="4"
      >
        {intl.formatMessage(messages.signUp)}
      </Button>
    </Flex>
  );
}

export default function Navbar() {
  const onSearch = useCallback(e => {
    e.preventDefault();
    const query = Object.fromEntries(new FormData(e.currentTarget).entries()) as ParsedUrlQuery;
    window.location.assign(`/agendas?${qs.stringify(query)}`);
  }, []);

  const headerRef = useRef();

  return (
    <Flex ref={headerRef} as="header" direction="column" bg="white" boxShadow="sm">
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" h="50" align="center">
          <Flex gap="8" h="full">
            <Flex as="a" href="/" px="4" align="center">
              <Image
                src={logoPic}
                width={500 / 4}
                height={89 / 4}
                alt="logo"
                quality="100"
              />
            </Flex>
            <Flex as="form" onSubmit={onSearch} display={{ base: 'none', lg: 'flex' }}>
              <SearchInput />
            </Flex>
          </Flex>

          <ProfileBar portalRef={headerRef} />
        </Flex>
      </Container>

      {/* Mobile menu here with headerRef + Portal */}
    </Flex>
  );
}
