import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Button, Container, Flex, Link } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/NavbarSearchInput';
import Image from 'components/Image';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';
import logoPic from '../../../public/images/openagenda.png';
import HelpButton from './HelpButton';
import ProfileLoader from './ProfileLoader';
import ProfileMenu from './ProfileMenu';
import useSearch from './useSearch';
import messages from './messages';

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
    <>
      <Button
        as={Link}
        href={hrefWithLang('/signin', intl.locale)}
        variant="link"
        colorScheme="primary"
        px="4"
        alignItems="center"
      >
        {intl.formatMessage(messages.signIn)}
      </Button>
      <Button
        as={Link}
        href={hrefWithLang('/signup', intl.locale)}
        variant="link"
        colorScheme="primary"
        px="4"
        alignItems="center"
      >
        {intl.formatMessage(messages.signUp)}
      </Button>
    </>
  );
}

export default function Navbar() {
  const intl = useIntl();

  const {
    inputValue,
    setInputValue,
    onSearch,
  } = useSearch();

  const headerRef = useRef();

  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;
  const homeHref = hrefWithLang('/', sessionUser ? null : intl.locale);

  return (
    <Flex ref={headerRef} as="header" direction="column" bg="white" boxShadow="sm">
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" h="50" align="stretch">
          <Flex gap="8">
            <Flex as="a" href={homeHref} px="4" align="center">
              <Image
                src={logoPic}
                width={500 / 4}
                height={89 / 4}
                alt="logo"
                quality="100"
              />
            </Flex>
            <Flex as="form" onSubmit={onSearch} display={{ base: 'none', lg: 'flex' }}>
              <SearchInput
                input={{
                  value: inputValue,
                  onChange: e => setInputValue(e.target.value),
                }}
              />
            </Flex>
          </Flex>

          <Flex direction="row" align="center">
            <HelpButton />
            <ProfileBar portalRef={headerRef} />
          </Flex>
        </Flex>
      </Container>

      {/* Mobile menu here with headerRef + Portal */}
    </Flex>
  );
}
