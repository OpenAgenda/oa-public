import StrapiPage from 'views/StrapiPage/index';
import intlMessagesLoader from '../loaders/intlMessagesLoader';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/StrapiPage',
  loaders: [intlMessagesLoader(StrapiPage.fetchLocale)],
  component: StrapiPage,
  decorators: [ProvidersDecorator],
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
      navFontColor: {
        name: 'oaWhite',
      },
      logoVariant: 'white',
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
            css: 'linear-gradient(to bottom, frenchBlue, 90%, moonStone)',
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
