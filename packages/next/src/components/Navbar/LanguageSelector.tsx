import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { Button, Text } from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faGlobe, faChevronDown } from 'icons/solid';
import { strapiUrlRegex } from 'utils/isNextUrl';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'oc', label: 'Occitan' },
];

export default function LanguageSelector() {
  const router = useRouter();
  const intl = useIntl();

  const currentLanguage =
    languages.find((lang) => lang.code === intl.locale) || languages[0];

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="ghost" size="sm" mx="2" alignSelf="center">
          <FaIcon icon={faGlobe} />
          <Text fontWeight="medium">{currentLanguage.label}</Text>
          <FaIcon icon={faChevronDown} size="sm" />
        </Button>
      </MenuTrigger>
      <MenuContent
        // Fix zIndex of menu + sticky navbar
        css={{ '--menu-z-index': 'zIndex.popover' }}
      >
        {languages.map((language) => (
          <MenuItem
            asChild
            key={language.code}
            value={language.code}
            disabled={language.code === intl.locale}
          >
            <NextLink
              href={strapiUrlRegex.test(router.asPath) ? '/' : router.asPath}
              locale={language.code}
            >
              {language.label}
            </NextLink>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
}
