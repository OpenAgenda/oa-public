import { http, HttpResponse } from 'msw';
import FeaturedAgendas from 'components/strapi/AutoFeaturedCardSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fixtures from './fixtures/autoFeaturedCardSet.json';
import officialAgendasResponse from './fixtures/officialAgendasResponse.json';

export default {
  title: 'strapi/FeaturedAgendas',
  component: FeaturedAgendas,
  decorators: [ProvidersDecorator],
};

export const Default = {
  args: {
    Cards: [
      {
        Card: {
          image: {
            url: '/jep2025.webp',
          },
          title: 'Journées européennes du patrimoine 2025',
          description:
            "La 42e édition des Journées européennes du patrimoine se déroulera les 20 et 21 septembre 2025. La journée dédiée au public scolaire se déroulera le vendredi 19 septembre (opération « Levez les yeux ! »)\nRetrouvez les informations et conditions pour participer à l'événement sur notre site Internet",
        },
      },
      {
        Card: {
          image: {
            url: '/jnarchi2025.webp',
          },
          title: 'Journées nationales de l’architecture 2025',
          description:
            "La 10eme édition des Journées nationales de l'architecture aura lieu du 16 au 19 octobre 2025 partout en France. Pour participer à l'événement, consulter notre site",
        },
      },
      {
        Card: {
          image: {
            url: '/pci.webp',
          },
          title: 'Vivre le patrimoine culturel immatériel',
          description:
            'Retrouvez toutes les manifestations du patrimoine culturel immatériel en France et ses activités de sauvegarde, de transmission et de valorisation.',
        },
      },
      {
        Card: {
          image: {
            url: 'rdvp.webp',
          },
          title: 'Le Rendez-vous des Parents 2025 dans le Saulnois',
          description:
            "Vous avez des enfants et vous vous posez des questions sur l'éducation, la scolarité, votre rôle de parent ?\nVenez échanger et discuter avec d'autres parents et des professionnels lors des Rendez-vous des parents !",
        },
      },
    ],
    count: 3,
  },
};

export const OnePresetAndRemaining5FromSearch = {
  args: fixtures,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/agendas', () =>
          HttpResponse.json(officialAgendasResponse),
        ),
      ],
    },
  },
};
