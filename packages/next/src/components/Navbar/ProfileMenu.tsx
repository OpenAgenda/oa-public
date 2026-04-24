import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Collapsible,
  IconButton,
  Link,
  Separator,
  Portal,
  useDisclosure,
} from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from '@openagenda/uikit/snippets';
import AuthDialog from 'components/auth/AuthDialog';
import Image from 'components/Image';
import SearchInput from 'components/NavbarSearchInput';
import { thumborLoader } from 'utils/imageLoader';
import hrefWithLang from 'utils/hrefWithLang';
import { FaIcon } from 'icons';
import { faBars } from 'icons/solid';
import messages from './messages';

type SearchProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
};

export default function ProfileMenu({
  user,
  portalRef,
  background = 'white',
  search,
}: {
  user: any;
  portalRef: React.RefObject<any>;
  background?: string;
  search: SearchProps;
}) {
  const intl = useIntl();

  const collapseId = 'header-menu-collapse';
  const { open, onToggle } = useDisclosure();

  const { inputValue, setInputValue, onSearch } = search;

  return (
    <>
      {/* Desktop content */}
      {user ? (
        <MenuRoot positioning={{ placement: 'bottom-end' }}>
          <MenuTrigger asChild>
            <Button
              variant="link"
              display={{ base: 'none', lg: 'flex' }}
              px="4"
              alignSelf="stretch"
            >
              {user.image ? (
                <Image
                  alt={intl.formatMessage(messages.profileMenu)}
                  src={
                    process.env.NODE_ENV === 'development'
                      ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${user.image}`
                      : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${user.image}`
                  }
                  fallbackSrc={
                    process.env.NODE_ENV === 'development'
                      ? `${process.env.NEXT_PUBLIC_S3_BUCKET}/${user.image}`
                      : undefined
                  }
                  loader={thumborLoader}
                  width="30"
                  height="30"
                />
              ) : 
                user.fullName
              }
            </Button>
          </MenuTrigger>
          <MenuContent
            color="black"
            background={background}
            minW="3xs"
            // Fix zIndex of menu + sticky navbar
            css={{ '--menu-z-index': 'zIndex.popover' }}
          >
            <MenuItem asChild value="agendas">
              <Link unstyled href="/home">
                {intl.formatMessage(messages.myAgendas)}
              </Link>
            </MenuItem>
            <MenuItem asChild value="events">
              <Link unstyled href="/home/events">
                {intl.formatMessage(messages.myEvents)}
              </Link>
            </MenuItem>
            <MenuSeparator />
            <MenuItem asChild value="settings">
              <Link unstyled href="/settings">
                {intl.formatMessage(messages.settings)}
              </Link>
            </MenuItem>
            <MenuItem asChild value="signout">
              <Link unstyled href="/signout">
                {intl.formatMessage(messages.signOut)}
              </Link>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      ) : (
        <>
          <AuthDialog reloadOnSuccess>
            <Button
              variant="link"
              display={{ base: 'none', lg: 'flex' }}
              px="4"
              alignItems="center"
              alignSelf="stretch"
            >
              {intl.formatMessage(messages.signIn)}
            </Button>
          </AuthDialog>
          <Button
            asChild
            variant="link"
            display={{ base: 'none', lg: 'flex' }}
            px="4"
            alignItems="center"
            alignSelf="stretch"
          >
            <Link unstyled href={hrefWithLang('/signup', intl.locale)}>
              {intl.formatMessage(messages.signUp)}
            </Link>
          </Button>
        </>
      )}

      {/* Mobile content */}
      <IconButton
        aria-label="Open Menu" // TODO translate
        variant="ghost"
        size="md"
        mr="4"
        display={{ base: 'flex', lg: 'none' }}
        aria-expanded={open}
        aria-controls={collapseId}
        onClick={onToggle}
      >
        <FaIcon icon={faBars} />
      </IconButton>
      <Portal container={portalRef}>
        <Collapsible.Root
          id={collapseId}
          open={open}
          background={background}
          position="absolute"
          top="100%"
          left={0}
          right={0}
        >
          <Collapsible.Content>
            <Box display={{ base: 'block', lg: 'none' }}>
              <form onSubmit={onSearch}>
                <SearchInput
                  h="50px"
                  input={{
                    value: inputValue,
                    onChange: (e) => setInputValue(e.target.value),
                  }}
                />
              </form>

              <Box py="2">
                {user ? (
                  <>
                    <Link
                      unstyled
                      href="/home"
                      display="block"
                      px="6"
                      py="3"
                      _hover={{
                        bg: 'primary.subtle/30',
                        textDecoration: 'underline',
                      }}
                    >
                      {intl.formatMessage(messages.myAgendas)}
                    </Link>
                    <Link
                      unstyled
                      href="/home/events"
                      display="block"
                      px="6"
                      py="3"
                      _hover={{
                        bg: 'primary.subtle/30',
                        textDecoration: 'underline',
                      }}
                    >
                      {intl.formatMessage(messages.myEvents)}
                    </Link>
                    <Separator my="2" />
                    <Link
                      unstyled
                      href="/settings"
                      display="block"
                      px="6"
                      py="3"
                      _hover={{
                        bg: 'primary.subtle/30',
                        textDecoration: 'underline',
                      }}
                    >
                      {intl.formatMessage(messages.settings)}
                    </Link>
                    <Link
                      unstyled
                      href="/signout"
                      display="block"
                      px="6"
                      py="3"
                      _hover={{
                        bg: 'primary.subtle/30',
                        textDecoration: 'underline',
                      }}
                    >
                      {intl.formatMessage(messages.signOut)}
                    </Link>
                  </>
                ) : (
                  <>
                    <AuthDialog reloadOnSuccess>
                      <Link
                        as="button"
                        display="block"
                        width="full"
                        textAlign="left"
                        px="6"
                        py="3"
                        _hover={{
                          bg: 'primary.subtle/30',
                          textDecoration: 'underline',
                        }}
                      >
                        {intl.formatMessage(messages.signIn)}
                      </Link>
                    </AuthDialog>
                    <Link
                      href={hrefWithLang('/signup', intl.locale)}
                      display="block"
                      px="6"
                      py="3"
                      _hover={{
                        bg: 'primary.subtle/30',
                        textDecoration: 'underline',
                      }}
                    >
                      {intl.formatMessage(messages.signUp)}
                    </Link>
                  </>
                )}
              </Box>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Portal>
    </>
  );
}
