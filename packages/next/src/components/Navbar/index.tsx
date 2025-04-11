import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { chakra, Box, Container, Flex } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/NavbarSearchInput';
import Image from 'components/Image';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';
import logoPic from '../../../public/images/oa.svg';
import miniLogoPic from '../../../public/images/oa_logo.svg';
import HelpButton from './HelpButton';
import ProfileLoader from './ProfileLoader';
import ProfileMenu from './ProfileMenu';
import useSearch from './useSearch';

function ProfileBar({ portalRef }) {
  const { user, status } = useUser();

  if (status === FetchStatus.Fetching) {
    return <ProfileLoader />;
  }

  // TODO error?.response?.status != 401 THEN toast error

  return <ProfileMenu portalRef={portalRef} user={user} />;
}

export default function Navbar() {
  const intl = useIntl();

  const { inputValue, setInputValue, onSearch } = useSearch();

  const headerRef = useRef(undefined);

  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;
  const homeHref = hrefWithLang('/', sessionUser ? null : intl.locale);

  return (
    <chakra.header
      ref={headerRef}
      display="flex"
      flexDirection="column"
      bg="white"
      boxShadow="xs"
    >
      <Container maxW="7xl" px={0}>
        <Flex justify="space-between" h="50px" align="stretch">
          <Flex gap="8">
            <chakra.a
              href={homeHref}
              pr="4"
              pl={{ base: '0', md: '4' }}
              display="flex"
              alignItems="center"
              flexShrink="0"
            >
              <Box display={{ base: 'none', md: 'block' }}>
                <Image src={logoPic} width="125" alt="logo" />
              </Box>
              <Box display={{ base: 'block', md: 'none' }}>
                <Image src={miniLogoPic} height="40" alt="logo" />
              </Box>
            </chakra.a>
            <chakra.form
              onSubmit={onSearch}
              display={{ base: 'none', lg: 'flex' }}
            >
              <SearchInput
                input={{
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                }}
              />
            </chakra.form>
          </Flex>

          <Flex direction="row" align="center">
            <HelpButton />
            <ProfileBar portalRef={headerRef} />
          </Flex>
        </Flex>
      </Container>

      {/* Mobile menu here with headerRef + Portal */}
    </chakra.header>
  );
}
