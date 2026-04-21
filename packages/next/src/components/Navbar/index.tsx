'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { chakra, Box, Container, Flex } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import useLocalePath from 'utils/useLocalePath';
import defaultSize from 'utils/defaultSize';
import getHomeHref from 'utils/getHomeHref';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/NavbarSearchInput';
import Image from 'components/Image';
import LanguageSelector from '../LanguageSelector';
import logoPic from '../../../public/images/oa.svg';
import whiteLogoPic from '../../../public/images/oa-white.svg';
import miniLogoPic from '../../../public/images/oa-picto.svg';
import whiteMiniLogoPic from '../../../public/images/oa-picto-white.svg';
import HelpButton from './HelpButton';
import ProfileLoader from './ProfileLoader';
import ProfileMenu from './ProfileMenu';

type SearchProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
};

function useSearch(): SearchProps {
  const router = useRouter();
  const searchParams = useSearchParams();
  const localePath = useLocalePath();

  const urlSearch = searchParams.get('search') ?? '';
  const [inputValue, setInputValue] = useState(urlSearch);

  // Sync input when URL changes (back/forward, external navigation)
  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  const onSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const target = e.target as typeof e.target & {
        search: { value: string };
      };

      const searchValue = target.search.value;
      const params = new URLSearchParams();
      if (searchValue) params.set('search', searchValue);

      router.push(localePath(`/agendas${params.size ? `?${params}` : ''}`));
    },
    [router, localePath],
  );

  return useMemo(
    () => ({
      inputValue,
      setInputValue,
      onSearch,
    }),
    [inputValue, onSearch],
  );
}

function ProfileBar({ portalRef, background, search }) {
  const { user, status } = useUser();

  if (status === FetchStatus.Fetching) {
    return <ProfileLoader />;
  }

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

type NavbarProps = {
  discreet?: boolean;
  colorPalette?: string;
  logoVariant?: 'regular' | 'white';
  sticky?: boolean;
  stickyBackground?: string;
};

export default function Navbar({
  discreet = false,
  colorPalette = undefined,
  logoVariant = 'regular',
  sticky = false,
  stickyBackground = undefined,
}: NavbarProps) {
  const intl = useIntl();
  const [atTop, setAtTop] = useState(true);

  const navbarRef = useRef(undefined);
  const [cookies] = useCookies();

  const search = useSearch();
  const { inputValue, setInputValue, onSearch } = search;

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
