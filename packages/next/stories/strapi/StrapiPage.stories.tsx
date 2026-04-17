import { http, HttpResponse } from 'msw';
import StrapiPage from '@/src/app/[locale]/strapi/[pageSlug]/_components/StrapiPage';
import StrapiPageClient from '@/src/app/[locale]/strapi/[pageSlug]/_components/StrapiPageClient';
import intlMessagesLoader from '../loaders/intlMessagesLoader';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import fetchLocale from '../utils/fetchLocale';

import userFixtures from './fixtures/user.json';

const Template = ({ page, footer }: any) => (
  <StrapiPageClient page={page}>
    <StrapiPage page={page} footer={footer} />
  </StrapiPageClient>
);

export default {
  title: 'strapi/StrapiPage',
  component: StrapiPage,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/fr/p/accueil',
      },
    },
  },
  render: Template,
};

const page = {
  title: 'PageHead basic white background',
  description: 'This is the story all about how',
  navFontColor: {
    name: 'primary',
  },
  Segments: [
    {
      id: 1,
      __component: 'segments.page-head',
      title: 'Créez un agenda, recensez et diffusez votre programmation',
      description:
        "OpenAgenda est une plateforme web dédiée à la diffusion d'événements publics. Un organisateur d'événements peut y saisir sa programmation une seule fois et la diffuser sur de multiples supports.",
      image: {
        url: '/guyWritingOnACalendar.50.resized.png',
        alternativeText: 'Calendap ?',
      },
      background: {
        name: 'oaWhite',
      },
      CTAs: [
        {
          label: 'Créer un agenda',
          link: '#',
        },
      ],
    },
  ],
};

export const PageWithThemeColor = {
  args: {
    page,
  },
};

export const PageWithTurquoiseToGreenGradient = {
  args: {
    page: {
      ...page,
      navSticky: true,
      navStickyBackground: {
        name: 'oaWhite',
      },
      navFontColor: {
        name: 'oaBlue',
      },
      Segments: [
        {
          id: 1,
          __component: 'segments.page-head',
          title: 'Créez un agenda, recensez et diffusez votre programmation',
          description:
            "OpenAgenda est une plateforme web dédiée à la diffusion d'événements publics. Un organisateur d'événements peut y saisir sa programmation une seule fois et la diffuser sur de multiples supports.",
          image: {
            url: '/casendapwhite50.resized.png',
            alternativeText: 'Calendap ?',
          },
          titleColor: {
            name: 'oaWhite',
          },
          background: {
            name: 'frenchBlueGradient',
            css: 'linear-gradient(to left, frenchBlue, 50%, moonStone)',
          },
          CTAs: [
            {
              label: 'Créer un agenda',
              link: '#',
            },
          ],
        },
      ],
    },
  },
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};

export const PageWithBlueGradient = {
  args: {
    page: {
      ...page,
      navFontColor: { name: 'azure' },
      logoVariant: 'white',
      Segments: [
        {
          id: 1,
          __component: 'segments.page-head',
          title: 'Créez un agenda, recensez et diffusez votre programmation',
          description:
            "OpenAgenda est une plateforme web dédiée à la diffusion d'événements publics. Un organisateur d'événements peut y saisir sa programmation une seule fois et la diffuser sur de multiples supports.",
          titleColor: {
            name: 'oaWhite',
          },
          background: {
            name: 'frenchBlue',
          },
          image: {
            url: '/casendapwhite50.resized.png',
            alternativeText: 'Calendap ?',
          },
          CTAs: [
            {
              label: 'Créer un agenda',
              link: '#',
            },
          ],
        },
      ],
    },
  },
};
