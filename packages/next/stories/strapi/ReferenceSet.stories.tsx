import type { StoryObj } from '@storybook/react';
import { Container } from '@openagenda/uikit';
import ReferenceSet from 'components/strapi/ReferenceSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import FullScreenDecorator from '../decorators/FullScreenDecorator';
import referenceSetData from './fixtures/referenceSet.json';

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
        References={referenceSetData.References.map((ref) => ({
          id: String(ref.id),
          link: ref.link,
          image: {
            url: ref.image.url,
            alternativeText: ref.image.alternativeText || undefined,
          },
          tags: ref.tags,
        }))}
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
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Container maxWidth="5xl">
      <ReferenceSet title="Aucune référence" References={[]} />
    </Container>
  ),
};
