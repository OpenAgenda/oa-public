import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import ContentLoader from 'react-content-loader';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Container,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToken,
} from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import SearchInput from 'components/SearchInput';
import Image from 'components/Image';
import logoPic from '../../../public/images/openagenda.png';

function awsImageLoader({ src }) {
  return `https://cibuldev.s3.amazonaws.com/${src}`;
}

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

function ProfileMenu({ user }) {
  const button = user.image ? (
    <Image
      alt="Profile menu"
      src={user.image}
      loader={awsImageLoader}
      width="30"
      height="30"
    />
  ) : user.fullName;

  return (
    <Menu placement="bottom-end" colorScheme="primary">
      {/* TODO `p={4} py={0}` -> `px={4}` after https://github.com/chakra-ui/chakra-ui/pull/6905 */}
      <MenuButton
        as={Button}
        variant="link"
        p="4"
        py="0"
        h="full"
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
        <MenuItem textAlign="right">Mes agendas</MenuItem>
        <MenuItem textAlign="right">Mes événements</MenuItem>
        <MenuDivider />
        <MenuItem textAlign="right">Paramètres</MenuItem>
        <MenuItem textAlign="right">Se déconnecter</MenuItem>
      </MenuList>
    </Menu>
  );

  // return (
  //   <Button variant="link" px="4">
  //     {user.fullName}
  //   </Button>
  // );
}

function ProfileBar() {
  const { user, status } = useUser();

  if (status === FetchStatus.Fetching) {
    return <ProfileLoader />;
  }

  // TODO error?.response?.status != 401 THEN toast error

  // Authenticated
  if (user) {
    return (
      <ProfileMenu user={user} />
    );
  }

  // Not authenticated
  return (
    <Flex direction="row" gap="6">
      <Button variant="link" colorScheme="primary">
        <FormattedMessage id="next.components.Navbar.signIn" defaultMessage="Sign in" />
      </Button>
      <Button variant="link" colorScheme="primary">
        <FormattedMessage id="next.components.Navbar.signUp" defaultMessage="Sign up" />
      </Button>
    </Flex>
  );
}

export default function Navbar() {
  const router = useRouter();
  const onSearch = useCallback(e => {
    e.preventDefault();
    const query = Object.fromEntries(new FormData(e.currentTarget).entries()) as ParsedUrlQuery;
    router.push({
      pathname: '/agendas',
      query,
    });
  }, [router]);

  return (
    <Flex as="header" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h="50">
          <Flex gap="8" h="full">
            <Flex as="a" href="" px="4" align="center">
              <Image
                src={logoPic}
                width={500 / 4}
                height={89 / 4}
                alt="logo"
                unoptimized
              />
            </Flex>
            <Flex as="form" onSubmit={onSearch}>
              <SearchInput />
            </Flex>
          </Flex>
          <Flex h="full" align="center">
            <ProfileBar />
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
}
