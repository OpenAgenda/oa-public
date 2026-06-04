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
import EmailSection from '@/src/app/[locale]/(app)/settings/_components/EmailSection';
import PasswordSection from '@/src/app/[locale]/(app)/settings/_components/PasswordSection';
import ImageSection from '@/src/app/[locale]/(app)/settings/_components/ImageSection';
import NotificationsSection from '@/src/app/[locale]/(app)/settings/_components/NotificationsSection';
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

// Representative /abilities/form-index payload: global (user) settings plus
// two member agendas. receiveEventUpdate is on for one agenda and off for the
// other, so its global parent renders indeterminate.
const NOTIFICATION_RULES = [
  {
    tag: 'user',
    actions: 'receive',
    subject: 'invitation',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'user',
    actions: 'receive',
    subject: 'notificationsSummary',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'user',
    actions: 'receive',
    subject: 'behavioralEmails',
    inverted: true,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventUpdate',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventAddition',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventUpdate',
    inverted: false,
    entityName: 'member',
    identifier: 111,
    entity: { agendaTitle: 'Festival du Livre' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventAddition',
    inverted: false,
    entityName: 'member',
    identifier: 111,
    entity: { agendaTitle: 'Festival du Livre' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventUpdate',
    inverted: true,
    entityName: 'member',
    identifier: 222,
    entity: { agendaTitle: "Concerts d'été" },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventAddition',
    inverted: false,
    entityName: 'member',
    identifier: 222,
    entity: { agendaTitle: "Concerts d'été" },
  },
];

// MSW handlers for the cibul-node user endpoints the sections call.
const okHandlers = [
  http.get('/abilities/form-index', () =>
    HttpResponse.json(NOTIFICATION_RULES),
  ),
  http.patch('/abilities/form-index', async ({ request }) =>
    HttpResponse.json(await request.json()),
  ),
  http.post('/newsletter/subscribe', () => HttpResponse.json({})),
  http.get('/users/me', () => HttpResponse.json(user)),
  http.patch('/users/me', () => HttpResponse.json(user)),
  http.patch(
    '/users/me/requestChangeEmail',
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.post(
    '/api/auth/change-password',
    () => new HttpResponse(null, { status: 200 }),
  ),
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

export const Email = {
  render: sectionStory('email', EmailSection),
};

// Wrong password → requestChangeEmail returns 403 → invalid-password error.
export const EmailWrongPassword = {
  parameters: {
    msw: {
      handlers: [
        http.patch(
          '/users/me/requestChangeEmail',
          () => new HttpResponse(null, { status: 403 }),
        ),
      ],
    },
  },
  render: sectionStory('email', EmailSection),
};

// Address already used → non-403 failure → "already used" error.
export const EmailTaken = {
  parameters: {
    msw: {
      handlers: [
        http.patch(
          '/users/me/requestChangeEmail',
          () => new HttpResponse(null, { status: 409 }),
        ),
      ],
    },
  },
  render: sectionStory('email', EmailSection),
};

export const Password = {
  render: sectionStory('password', PasswordSection),
};

// Wrong current password → better-auth returns INVALID_PASSWORD.
export const PasswordInvalidCurrent = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/auth/change-password', () =>
          HttpResponse.json({ code: 'INVALID_PASSWORD' }, { status: 400 }),
        ),
      ],
    },
  },
  render: sectionStory('password', PasswordSection),
};

export const Image = {
  render: sectionStory('image', ImageSection),
};

export const Notifications = {
  render: sectionStory('notifications', NotificationsSection),
};

// 10 agendas (≥ the search threshold) to exercise the fuzzy agenda filter.
const MANY_AGENDA_TITLES = [
  'Festival du Livre',
  "Concerts d'été",
  'Marché de Noël',
  'Cinéma en plein air',
  'Théâtre municipal',
  'Expo photo',
  'Brocante du dimanche',
  'Forum des associations',
  'Salon du vin',
  'Carnaval',
];
const MANY_NOTIFICATION_RULES = [
  {
    tag: 'user',
    actions: 'receive',
    subject: 'invitation',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  {
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventUpdate',
    inverted: false,
    entityName: 'user',
    identifier: 12345,
    entity: { fullName: 'Marie Dupont' },
  },
  ...MANY_AGENDA_TITLES.map((agendaTitle, i) => ({
    tag: 'contributor',
    actions: 'receive',
    subject: 'eventUpdate',
    inverted: false,
    entityName: 'member',
    identifier: 1000 + i,
    entity: { agendaTitle },
  })),
];

export const NotificationsSearch = {
  parameters: {
    msw: {
      handlers: [
        http.get('/abilities/form-index', () =>
          HttpResponse.json(MANY_NOTIFICATION_RULES),
        ),
      ],
    },
  },
  render: sectionStory('notifications', NotificationsSection),
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
