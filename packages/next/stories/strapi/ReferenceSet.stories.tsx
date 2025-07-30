import type { StoryObj } from '@storybook/react';
import { Container } from '@openagenda/uikit';
import ReferenceSet from 'components/strapi/ReferenceSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import FullScreenDecorator from '../decorators/FullScreenDecorator';
import referenceSetData from './fixtures/referenceSet.json';

const stevens = [
  {
    id: '1',
    link: 'https://www.openagenda.com',
    image: {
      url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
      alternativeText: 'OpenAgenda',
    },
    tags: 'Technologie, SaaS, Événements',
  },
  {
    id: '2',
    link: 'https://www.example.com',
    image: {
      url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
      alternativeText: 'Partenaire Tech',
    },
    tags: 'Technologie, Innovation, IA',
  },
  {
    id: '3',
    link: 'https://www.culture.fr',
    image: {
      url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
      alternativeText: 'Partenaire Culture',
    },
    tags: 'Culture, Événements, Art',
  },
  {
    id: '4',
    link: 'https://www.startup.io',
    image: {
      url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
      alternativeText: 'Startup',
    },
    tags: 'Innovation, SaaS, IA',
  },
  {
    id: '5',
    image: {
      url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
      alternativeText: 'Organisme public',
    },
    tags: 'Public, Culture, Subventions',
  },
];

const stevensWithTitles = stevens.map((s, i) => ({
  ...s,
  title: ['Steven', 'Phteven', 'Pthevfen', 'Phhtfvveen', 'Pfvfthtv'][i],
}));

export default {
  title: 'strapi/ReferenceSet',
  component: ReferenceSet,
  decorators: [FullScreenDecorator, ProvidersDecorator],
};
type Story = StoryObj<typeof ReferenceSet>;

export const Overview: Story = {
  render: () => (
    <Container>
      <ReferenceSet
        title={referenceSetData.title}
        description="Découvrez nos partenaires et références qui nous font confiance"
        References={referenceSetData.References.map((ref) => ({
          id: String(ref.id),
          link: ref.link,
          image: {
            url: ref.image.url,
            alternativeText: ref.image.alternativeText || undefined,
          },
          title: ref.title,
          tags: ref.tags,
        }))}
        CTAs={[
          {
            label: 'Moi aussi',
            link: 'https://moi.fr',
            variant: 'solid',
            colorPalette: {
              name: 'strapi.blueGreen',
            },
          },
        ]}
      />
    </Container>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
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
  ),
};

export const SingleReference: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Référence unique"
        description="Un exemple avec une seule référence pour démonstration"
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo unique',
            },
            tags: 'Principal, Technologie, Innovation',
            title: 'Titre de démonstration',
          },
        ]}
      />
    </Container>
  ),
};

export const WithoutTags: Story = {
  render: () => (
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
            title: 'Première référence',
          },
          {
            id: '2',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Autre logo sans tags',
            },
            title: 'Deuxième référence',
          },
        ]}
      />
    </Container>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet References={[]} />
    </Container>
  ),
};

export const WithFilter: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Références avec filtrage par tags"
        hasFilter={true}
        References={stevens}
      />
    </Container>
  ),
};

export const WithBigIllustration: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Références avec filtrage par tags"
        hasFilter={true}
        References={stevens}
        smallImages={false}
      />
    </Container>
  ),
};

export const WithBigIllustrationAndTitle: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Références avec filtrage par tags"
        hasFilter={true}
        References={stevensWithTitles}
        smallImages={false}
      />
    </Container>
  ),
};

export const WithFilterManyTags: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="Nombreux tags disponibles"
        hasFilter={true}
        References={[
          {
            id: '1',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 1',
            },
            tags: 'React, TypeScript, Frontend, Web, UI/UX',
          },
          {
            id: '2',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 2',
            },
            tags: 'Node.js, Backend, API, Database, MongoDB',
          },
          {
            id: '3',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 3',
            },
            tags: 'DevOps, Docker, Kubernetes, CI/CD, AWS',
          },
          {
            id: '4',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 4',
            },
            tags: 'Machine Learning, Python, AI, Data Science, TensorFlow',
          },
          {
            id: '5',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 5',
            },
            tags: 'Mobile, React Native, iOS, Android, Cross-platform',
          },
          {
            id: '6',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Ref 6',
            },
            tags: 'Design, Figma, Sketch, Prototyping, UI/UX',
          },
        ]}
      />
    </Container>
  ),
};

export const WithFilterNoTags: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet
        title="hasFilter=true mais aucun tag disponible"
        hasFilter={true}
        References={[
          {
            id: '1',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Sans tags',
            },
          },
          {
            id: '2',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Sans tags aussi',
            },
          },
        ]}
      />
    </Container>
  ),
};

export const WithTitles: Story = {
  render: () => (
    <Container>
      <ReferenceSet
        title="Références avec titres"
        References={[
          {
            id: '1',
            link: 'https://www.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo OpenAgenda',
            },
            title: 'Plateforme OpenAgenda',
            tags: 'Plateforme, Événements',
          },
          {
            id: '2',
            link: 'https://doc.openagenda.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Documentation',
            },
            title: 'Guide de documentation',
            tags: 'Documentation, Aide',
          },
          {
            id: '3',
            link: 'https://www.example.com',
            image: {
              url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
              alternativeText: 'Logo exemple',
            },
            tags: 'Exemple',
          },
        ]}
      />
    </Container>
  ),
};

export const WithSubtleBackground = {
  render: () => (
    <ReferenceSet
      title="Références avec fond coloré"
      description="Découvrez nos partenaires et références qui nous font confiance"
      References={referenceSetData.References.map((ref) => ({
        id: String(ref.id),
        link: ref.link,
        image: {
          url: ref.image.url,
          alternativeText: ref.image.alternativeText || undefined,
        },
        title: ref.title,
        tags: ref.tags,
      }))}
      backgroundColor={{ name: 'rosyRed' }}
    />
  ),
};
