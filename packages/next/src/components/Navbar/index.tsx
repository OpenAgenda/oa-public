import Image from 'next/future/image';
import ContentLoader from 'react-content-loader';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Center,
  Button,
  Container,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToken,
} from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import logoPic from '../../../public/images/openagenda.png';

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
  if (user.image) {
    return <Image alt="Profile menu" src={user.image} />;
  }

  return (
    <Menu placement="bottom-end" colorScheme="primary">
      <MenuButton as={Button} variant="link" px="4">
        {user.fullName}
      </MenuButton>
      <MenuList>
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
    <HStack spacing="6">
      <Button variant="link" colorScheme="primary">
        <FormattedMessage id="next.components.Navbar.signIn" defaultMessage="Sign in" />
      </Button>
      <Button variant="link" colorScheme="primary">
        <FormattedMessage id="next.components.Navbar.signUp" defaultMessage="Sign up" />
      </Button>
    </HStack>
  );
}

export default function Navbar() {
  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <HStack spacing="8" justify="space-between" h={50}>
          <Center>
            <Image src={logoPic} width={125} height={22} alt="logo" quality={100} />
          </Center>
          <Flex justify="right" h="full">
            <ProfileBar />
          </Flex>
        </HStack>
      </Container>
    </Box>
  );
}
