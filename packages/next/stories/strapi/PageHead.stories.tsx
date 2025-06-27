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

export const WithColors = {
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
      },
    ],
    backgroundColor: {
      name: 'strapi.blueGreen',
    },
    titleColor: {
      name: 'white',
    },
    descriptionColor: {
      name: 'white',
    },
  },
};
