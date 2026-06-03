import { http, HttpResponse } from 'msw';
import { IntlProvider } from 'react-intl';
import {
  UIKitProvider,
  system as defaultSystem,
  defaultCache,
  Container,
} from '@openagenda/uikit';
import { AccordionRoot } from '@openagenda/uikit/snippets';
import SettingsPageClient from '@/src/app/[locale]/(app)/settings/_components/SettingsPageClient';
import FullNameSection from '@/src/app/[locale]/(app)/settings/_components/FullNameSection';
import LanguageSection from '@/src/app/[locale]/(app)/settings/_components/LanguageSection';
import ImageSection from '@/src/app/[locale]/(app)/settings/_components/ImageSection';
import DeleteAccountSection from '@/src/app/[locale]/(app)/settings/_components/DeleteAccountSection';
import type { SettingsUser } from '@/src/app/[locale]/(app)/settings/_components/types';
import frMessages from '@/src/app/[locale]/(app)/settings/_components/locales/fr.json';
import enMessages from '@/src/app/[locale]/(app)/settings/_components/locales/en.json';

const MESSAGES: Record<string, Record<string, string>> = {
  fr: frMessages,
  en: enMessages,
};

const user: SettingsUser = {
  uid: 12345,
  fullName: 'Marie Dupont',
  email: 'marie.dupont@example.com',
  culture: 'fr',
  image: 'user.profile.12345.sample.jpg',
  hasLocalAccount: true,
};

// Wrap stories in the same UIKit + react-intl providers the app's Providers.tsx
// sets up. `locale` defaults to `fr`; switch it via the `locale` arg to preview
// translations. The Storybook preview already provides SWRConfig and the light
// theme, so we only add the system + intl layers here.
function withProviders(locale: string, Story: React.ComponentType) {
  return (
    <UIKitProvider system={defaultSystem} cache={defaultCache}>
      <IntlProvider locale={locale} messages={MESSAGES[locale] ?? enMessages}>
        <Story />
      </IntlProvider>
    </UIKitProvider>
  );
}

// MSW handlers for the cibul-node user endpoints the sections call.
const okHandlers = [
  http.get('/users/me', () => HttpResponse.json(user)),
  http.patch('/users/me', () => HttpResponse.json(user)),
  http.delete('/users/me', () => new HttpResponse(null, { status: 200 })),
];

const meta = {
  title: 'Settings/Page',
  parameters: {
    layout: 'fullscreen',
    // Required for next/navigation hooks (useRouter) used by useUser().
    nextjs: { appDirectory: true },
    msw: { handlers: okHandlers },
  },
  argTypes: {
    locale: {
      control: 'inline-radio',
      options: ['fr', 'en'],
    },
  },
  args: { locale: 'fr' },
};

export default meta;

// Full page: loads `/users/me` via useUser() and renders the flat accordion
// (Nom d'utilisateur, Langue, Supprimer mon compte).
export const FullPage = {
  render: ({ locale }: { locale: string }) =>
    withProviders(locale, SettingsPageClient),
};

// A helper that mounts a single section inside an AccordionRoot (AccordionItem
// needs the Accordion.Root context) with the matching item open by default.
function sectionStory(
  defaultOpen: string,
  Section: React.ComponentType<any>,
  extraProps: Record<string, unknown> = {},
) {
  return ({ locale }: { locale: string }) =>
    withProviders(locale, () => (
      <Container maxW="3xl" py="8">
        <AccordionRoot multiple collapsible defaultValue={[defaultOpen]}>
          <Section user={user} onUpdated={() => {}} {...extraProps} />
        </AccordionRoot>
      </Container>
    ));
}

export const FullName = {
  render: sectionStory('fullName', FullNameSection),
};

export const Language = {
  render: sectionStory('language', LanguageSection),
};

export const Image = {
  render: sectionStory('image', ImageSection),
};

export const DeleteAccount = {
  render: sectionStory('deleteAccount', DeleteAccountSection),
};

// Wrong password → the DELETE returns 403 and the section shows the
// invalid-password error.
export const DeleteAccountWrongPassword = {
  parameters: {
    msw: {
      handlers: [
        http.delete('/users/me', () => new HttpResponse(null, { status: 403 })),
      ],
    },
  },
  render: sectionStory('deleteAccount', DeleteAccountSection),
};

// Save failure → the PATCH returns 500 and the section shows the generic error.
export const SaveError = {
  parameters: {
    msw: {
      handlers: [
        http.patch('/users/me', () => new HttpResponse(null, { status: 500 })),
      ],
    },
  },
  render: sectionStory('fullName', FullNameSection),
};
