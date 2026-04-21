'use client';

import { useIntl } from 'react-intl';
import { usePathname } from 'next/navigation';
import { Button, Text } from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faGlobe, faChevronDown } from 'icons/solid';
import { SUPPORTED_LOCALES } from 'config/constants';

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1])) {
    return '/' + segments.slice(2).join('/') || '/';
  }
  return pathname;
}

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'oc', label: 'Occitan' },
];

export default function LanguageSelector() {
  const intl = useIntl();
  const pathname = usePathname();

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
            <a href={`/${language.code}${stripLocalePrefix(pathname)}`}>
              {language.label}
            </a>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
}
