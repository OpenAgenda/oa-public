import { useRef, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { chakra, Box, Container, Flex } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import defaultSize from 'utils/defaultSize';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/NavbarSearchInput';
import Image from 'components/Image';
import getHomeHref from 'utils/getHomeHref';
import logoPic from '../../../public/images/oa.svg';
import whiteLogoPic from '../../../public/images/oa-white.svg';
import miniLogoPic from '../../../public/images/oa-picto.svg';
import whiteMiniLogoPic from '../../../public/images/oa-picto-white.svg';
import HelpButton from './HelpButton';
import ProfileLoader from './ProfileLoader';
import ProfileMenu from './ProfileMenu';

function ProfileBar({ portalRef, background, search }) {
  const { user, status } = useUser();

  if (status === FetchStatus.Fetching) {
    return <ProfileLoader />;
  }

  // TODO error?.response?.status != 401 THEN toast error

  return (
    <ProfileMenu
      portalRef={portalRef}
      user={user}
      background={background}
      search={search}
    />
  );
}

function getPosition({ discreet, sticky }) {
  if (sticky) {
    return 'sticky';
  }

  return discreet ? 'absolute' : 'relative';
}

function getBackground({ discreet, atTop, stickyBackground }) {
  if (!discreet) {
    return 'white';
  }

  if (!atTop && stickyBackground) {
    return stickyBackground;
  }
}

type SearchProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
};

type BaseNavbarProps = {
  discreet?: boolean;
  colorPalette?: string;
  logoVariant?: 'regular' | 'white';
  sticky?: boolean;
  stickyBackground?: string;
  search: SearchProps;
  LanguageSelector: React.ComponentType;
};

export default function BaseNavbar({
  discreet = false,
  colorPalette = undefined,
  logoVariant = 'regular',
  sticky = false,
  stickyBackground = undefined,
  search,
  LanguageSelector,
}: BaseNavbarProps) {
  const intl = useIntl();
  const [atTop, setAtTop] = useState(true);

  const navbarRef = useRef(undefined);
  const [cookies] = useCookies();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      if (navbarRef.current) {
        setAtTop(window.scrollY === 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { inputValue, setInputValue, onSearch } = search;

  return (
    <chakra.header
      ref={navbarRef}
      display="flex"
      flexDirection="column"
      bg={getBackground({
        discreet,
        atTop,
        stickyBackground,
      })}
      position={getPosition({ discreet, sticky })}
      top={0}
      left={0}
      right={0}
      zIndex={discreet || sticky ? 'sticky' : undefined}
      boxShadow={discreet ? undefined : 'xs'}
      fontSize={defaultSize}
      colorPalette={colorPalette}
      mb={sticky ? '-50px' : undefined}
      transition="backgrounds"
    >
      <Container maxW="7xl" px={0}>
        <Flex justify="space-between" h="50px" align="stretch">
          <Flex gap="8">
            <chakra.a
              href={getHomeHref(cookies, intl)}
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
                  : undefined
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
            <ProfileBar
              portalRef={navbarRef}
              background={getBackground({
                atTop: false,
                discreet,
                stickyBackground,
              })}
              search={search}
            />
          </Flex>
        </Flex>
      </Container>

      {/* Mobile menu here with headerRef + Portal */}
    </chakra.header>
  );
}
