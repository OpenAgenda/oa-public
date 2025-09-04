import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { chakra, Box, Container, Flex } from '@openagenda/uikit';
import { isUndefined } from 'swr/_internal';
import useUser from 'hooks/useUser';
import defaultSize from 'utils/defaultSize';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/NavbarSearchInput';
import Image from 'components/Image';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';
import logoPic from '../../../public/images/oa.svg';
import whiteLogoPic from '../../../public/images/oa-white.svg';
import miniLogoPic from '../../../public/images/oa-picto.svg';
import whiteMiniLogoPic from '../../../public/images/oa-picto-white.svg';
import HelpButton from './HelpButton';
import LanguageSelector from './LanguageSelector';
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

export default function Navbar({
  discreet = false,
  fontColor = undefined,
  logoVariant = 'regular',
}) {
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
      bg={discreet ? undefined : 'white'}
      position={discreet ? 'absolute' : 'relative'}
      top={discreet ? 0 : undefined}
      left={discreet ? 0 : undefined}
      right={discreet ? 0 : undefined}
      zIndex={discreet ? 1000 : undefined}
      boxShadow={discreet ? undefined : 'xs'}
      fontSize={defaultSize}
      colorPalette={fontColor}
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
                <Image
                  src={logoVariant === 'white' ? whiteLogoPic : logoPic}
                  width="125"
                  alt="logo"
                />
              </Box>
              <Box display={{ base: 'block', md: 'none' }}>
                <Image
                  src={logoVariant === 'white' ? whiteMiniLogoPic : miniLogoPic}
                  height="40"
                  alt="logo"
                />
              </Box>
            </chakra.a>
            <chakra.form
              onSubmit={onSearch}
              display={{ base: 'none', lg: 'flex' }}
              css={
                discreet
                  ? {
                      margin: '7px',
                    }
                  : isUndefined
              }
            >
              <SearchInput
                discreet={discreet}
                input={{
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                }}
              />
            </chakra.form>
          </Flex>

          <Flex direction="row" align="center">
            <HelpButton />
            <LanguageSelector />
            <ProfileBar portalRef={headerRef} />
          </Flex>
        </Flex>
      </Container>

      {/* Mobile menu here with headerRef + Portal */}
    </chakra.header>
  );
}
