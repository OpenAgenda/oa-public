import type { StoryObj } from '@storybook/react';
import { Container } from '@openagenda/uikit';
import VideoPlayer from 'components/strapi/VideoPlayer';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import FullScreenDecorator from '../decorators/FullScreenDecorator';
import intlMessagesLoader from '../loaders/intlMessagesLoader';
import fetchLocale from '../utils/fetchLocale';

export default {
  title: 'strapi/VideoPlayer',
  component: VideoPlayer,
  decorators: [FullScreenDecorator, ProvidersDecorator],
  loaders: [intlMessagesLoader(fetchLocale)],
};

type Story = StoryObj<typeof VideoPlayer>;

export const Overview: Story = {
  render: () => (
    <Container maxW="5xl">
      <VideoPlayer
        title="Présentation d'OpenAgenda"
        poster="https://storage.openagenda.com/assets/videos/presentation/poster.jpg"
      />
    </Container>
  ),
};

export const WithoutPoster: Story = {
  render: () => (
    <Container maxW="5xl">
      <VideoPlayer title="Vidéo de démonstration" />
    </Container>
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <Container maxW="5xl">
      <VideoPlayer
        title="Ma vidéo personnalisée"
        poster="https://storage.openagenda.com/assets/videos/presentation/poster.jpg"
      />
    </Container>
  ),
};

export const MinimalConfiguration: Story = {
  render: () => (
    <Container maxW="5xl">
      <VideoPlayer />
    </Container>
  ),
};
