import { useIntl } from 'react-intl';
import {
  chakra,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  useDisclosure,
} from '@openagenda/uikit';
import Image from 'components/Image';
import SearchInput from 'components/NavbarSearchInput';
import { thumborLoader } from 'utils/imageLoader';
import { FaIcon } from 'icons';
import { faBars } from 'icons/solid';
import useSearch from './useSearch';
import messages from './messages';

const StyledSearchInput = chakra(SearchInput);

export default function ProfileMenu({ user, portalRef }) {
  const intl = useIntl();

  const collapseId = 'header-menu-collapse';
  const { getButtonProps, isOpen } = useDisclosure({ id: collapseId });

  const { inputValue, setInputValue, onSearch } = useSearch();

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
          alignSelf="stretch"
        >
          {user.image ? (
            <Image
              alt={intl.formatMessage(messages.profileMenu)}
              src={
                process.env.NODE_ENV === 'development'
                  ? `${process.env.NEXT_PUBLIC_DEV_AWS_BUCKET}/${user.image}`
                  : `${process.env.NEXT_PUBLIC_AWS_BUCKET}/${user.image}`
              }
              fallbackSrc={
                process.env.NODE_ENV === 'development'
                  ? `${process.env.NEXT_PUBLIC_AWS_BUCKET}/${user.image}`
                  : undefined
              }
              loader={thumborLoader}
              width="30"
              height="30"
            />
          )
            : user.fullName}
        </MenuButton>
        <MenuList
          // https://github.com/chakra-ui/chakra-ui/issues/5742
          zIndex="popover"
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
        aria-label="Open Menu" // TODO translate
        size="md"
        variant="ghost"
        mr="4"
        icon={<FaIcon icon={faBars} />}
        display={{ base: 'flex', lg: 'none' }}
        {...getButtonProps()}
      />
      <Portal containerRef={portalRef}>
        <Collapse id={collapseId} in={isOpen}>
          <Box display={{ base: 'block', lg: 'none' }}>
            <form onSubmit={onSearch}>
              <StyledSearchInput
                h="50px"
                input={{
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                }}
              />
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
