import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Container, Flex } from '@openagenda/uikit';
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

  const headerRef = useRef();

  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;
  const homeHref = hrefWithLang('/', sessionUser ? null : intl.locale);

  return (
    <Flex
      ref={headerRef}
      as="header"
      direction="column"
      bg="white"
      boxShadow="sm"
    >
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" h="50" align="stretch">
          <Flex gap="8">
            <Flex
              as="a"
              href={homeHref}
              pr="4"
              pl={{ base: '0', md: '4' }}
              align="center"
              shrink="0"
            >
              <Image
                src={logoPic}
                width="125"
                alt="logo"
                display={{ base: 'none', md: 'block' }}
              />
              <Image
                src={miniLogoPic}
                height="40"
                alt="logo"
                display={{ base: 'block', md: 'none' }}
              />
            </Flex>
            <Flex
              as="form"
              onSubmit={onSearch}
              display={{ base: 'none', lg: 'flex' }}
            >
              <SearchInput
                input={{
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
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
