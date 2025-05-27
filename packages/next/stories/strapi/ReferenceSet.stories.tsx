import { Container } from '@openagenda/uikit';
import ReferenceSet from 'components/strapi/ReferenceSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/ReferenceSet',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Nos partenaires"
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo OpenAgenda',
            },
            tags: 'Technologie, SaaS, Événements',
          },
          {
            id: '2',
            link: 'https://www.example.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo partenaire',
            },
            tags: 'Culture, Art, Musée',
          },
          {
            id: '3',
            link: 'https://www.partner3.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo troisième partenaire',
            },
            tags: 'Sport, Loisirs',
          },
        ]}
      />
    </Container>
  );
}

export function WithoutTitle() {
  return (
    <Container maxWidth="5xl">
      <ReferenceSet
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo OpenAgenda',
            },
            tags: 'Technologie, SaaS',
          },
          {
            id: '2',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo sans lien',
            },
            tags: 'Culture',
          },
        ]}
      />
    </Container>
  );
}

export function SingleReference() {
  return (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Partenaire principal"
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo unique',
            },
            tags: 'Principal, Technologie, Innovation',
          },
        ]}
      />
    </Container>
  );
}

export function WithoutTags() {
  return (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Références sans tags"
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo sans tags',
            },
          },
          {
            id: '2',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Autre logo sans tags',
            },
          },
        ]}
      />
    </Container>
  );
}

export function EmptyState() {
  return (
    <Container maxWidth="5xl">
      <ReferenceSet title="Aucune référence" References={[]} />
    </Container>
  );
}
