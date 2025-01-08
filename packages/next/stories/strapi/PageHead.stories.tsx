import PageHead from 'components/strapi/PageHead';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import PageContainerDecorator from './decorators/PageContainerDecorator';

export default {
  title: 'strapi/PageHead',
  component: PageHead,
  decorators: [PageContainerDecorator, ProvidersDecorator],
};

export const Default = {
  args: {
    title: 'Recensez et diffusez tous vos événements',
    description:
      "OpenAgenda vous permet de gérer, collaborer et diffuser des événements autour d'un ou plusieurs agendas interconnectés",
    illustration: {
      url: 'https://cdn.openagenda.com/dev/corpo/organisation_825197342c.jpg',
      alternativeText: 'Organisation illustration',
    },
    cta: {
      label: 'Créer un agenda',
      link: '/agendas/new',
    },
  },
};

export const LongDescription = {
  args: {
    title: 'Gérez vos événements efficacement',
    description:
      "OpenAgenda offre une suite complète d'outils pour la gestion et la diffusion de vos événements. Créez, organisez et partagez facilement vos agendas avec votre communauté.",
    illustration: {
      url: 'https://cdn.openagenda.com/dev/corpo/organisation_825197342c.jpg',
      alternativeText: "Gestion d'événements",
    },
    cta: {
      label: 'Commencer maintenant',
      link: '/register',
    },
  },
};
