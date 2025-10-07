import PageHead from 'components/strapi/PageHead';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/PageHead',
  component: PageHead,
  decorators: [ProvidersDecorator],
};

export const Default = {
  args: {
    title: 'Recensez et diffusez tous vos événements',
    description:
      "OpenAgenda vous permet de gérer, collaborer et diffuser des événements autour d'un ou plusieurs agendas interconnectés",
    image: {
      url: '/guyWritingOnACalendar.png',
      alternativeText: 'Guy writing something on a calendar',
      width: '673px',
      height: '673px',
    },
    CTAs: [
      {
        label: 'Créer un agenda',
        link: '/agendas/new',
      },
    ],
  },
};

export const NoIllustration = {
  args: {
    title: 'Intégrez votre agenda à votre site',
    description:
      'Une **API**, un code à coller sur votre page, des plugins *Drupal*, *Wordpress* et *Typo3*',
    CTAs: [
      {
        label: 'Sortir le chien',
        link: 'https://woafy.fr/quand-et-combien-de-faut-il-sortir-son-chien-au-minimum/',
        colorPalette: {
          name: 'strapi.blueGreen',
        },
      },
    ],
  },
};

export const WithSolidBackground = {
  args: {
    title: 'Vous ne savez pas quoi écrire dans votre Casendap ?',
    description: "Mettez un 12, on n'est plus à ça près.",
    image: {
      url: '/casendapwhite.png',
      alternativeText: 'Un casendap',
    },
    CTAs: [
      {
        label: 'Mettre un 12',
        link: 'https://google.com?q=12',
        variant: 'solid',
      },
      {
        label: 'Mettre un 24',
        link: 'https://oa.com',
        colorPalette: {
          name: 'white',
        },
        variant: 'link',
      },
    ],
    background: {
      name: 'frenchBlue',
    },
    titleColor: {
      name: 'oaWhite',
    },
    descriptionColor: {
      name: 'oaWhite',
    },
  },
};

export const CharcoalAndWhiteWithoutAnImage = {
  args: {
    title: 'Intégrez votre agenda à votre site',
    description:
      'Une **API**, un code à coller sur votre page, des plugins *Drupal*, *Wordpress* et *Typo3*',
    background: {
      name: 'charcoal',
    },
    titleColor: {
      name: 'oaWhite',
    },
    descriptionColor: {
      name: 'oaWhite',
    },
    fontColor: {
      name: 'oaWhite',
    },
  },
};

export const WithVideo = {
  args: {
    title:
      "Publiez un agenda, rassemblez et diffusez toutes vos annonces d'événements",
    description:
      "OpenAgenda simplifie la gestion d'agendas pour les organisateurs, les collectivités et les développeurs. Publiez en quelques minutes et diffusez sur de multiples supports.",
    video: 'presentation',
    CTAs: [
      {
        id: 8146,
        label: 'Créer un agenda',
        link: 'https://openagenda.com/agendas/new',
        variant: 'solid',
        color: null,
      },
    ],
  },
};
