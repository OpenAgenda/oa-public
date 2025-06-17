import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { chakra } from '@openagenda/uikit';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  // Track,
  type MediaSrc,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
  isHLSProvider,
  isDASHProvider,
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import messages from './videoPlayerMessages';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import styles from './VideoPlayer.module.scss';

const StyledMediaPlayer = chakra(MediaPlayer);

interface VideoPlayerProps {
  title?: string;
  poster?: string;
  video?: string; // Nom de la vidéo pour le mapping ou génération automatique
  sources?: MediaSrc[]; // Sources personnalisées optionnelles
}

// Traductions pour le player Vidstack utilisant react-intl avec les clés exactes de Vidstack
const getVideoTranslations = (intl: any) => ({
  Announcements: intl.formatMessage(messages.announcements),
  Accessibility: intl.formatMessage(messages.accessibility),
  AirPlay: intl.formatMessage(messages.airPlay),
  Audio: intl.formatMessage(messages.audio),
  Auto: intl.formatMessage(messages.auto),
  Boost: intl.formatMessage(messages.boost),
  Captions: intl.formatMessage(messages.captions),
  'Caption Styles': intl.formatMessage(messages.captionStyles),
  'Captions look like this': intl.formatMessage(messages.captionsLookLikeThis),
  Chapters: intl.formatMessage(messages.chapters),
  'Closed-Captions Off': intl.formatMessage(messages.closedCaptionsOff),
  'Closed-Captions On': intl.formatMessage(messages.closedCaptionsOn),
  Connected: intl.formatMessage(messages.connected),
  Continue: intl.formatMessage(messages.continue),
  Connecting: intl.formatMessage(messages.connecting),
  Default: intl.formatMessage(messages.default),
  Disabled: intl.formatMessage(messages.disabled),
  Disconnected: intl.formatMessage(messages.disconnected),
  'Display Background': intl.formatMessage(messages.displayBackground),
  Download: intl.formatMessage(messages.download),
  'Enter Fullscreen': intl.formatMessage(messages.enterFullscreen),
  'Enter PiP': intl.formatMessage(messages.enterPiP),
  'Exit Fullscreen': intl.formatMessage(messages.exitFullscreen),
  'Exit PiP': intl.formatMessage(messages.exitPiP),
  Font: intl.formatMessage(messages.font),
  Family: intl.formatMessage(messages.family),
  Fullscreen: intl.formatMessage(messages.fullscreen),
  'Google Cast': intl.formatMessage(messages.googleCast),
  'Keyboard Animations': intl.formatMessage(messages.keyboardAnimations),
  LIVE: intl.formatMessage(messages.live),
  Loop: intl.formatMessage(messages.loop),
  Mute: intl.formatMessage(messages.mute),
  Normal: intl.formatMessage(messages.normal),
  Off: intl.formatMessage(messages.off),
  Pause: intl.formatMessage(messages.pause),
  Play: intl.formatMessage(messages.play),
  Playback: intl.formatMessage(messages.playback),
  PiP: intl.formatMessage(messages.pip),
  Quality: intl.formatMessage(messages.quality),
  Replay: intl.formatMessage(messages.replay),
  Reset: intl.formatMessage(messages.reset),
  'Seek Backward': intl.formatMessage(messages.seekBackward),
  'Seek Forward': intl.formatMessage(messages.seekForward),
  Seek: intl.formatMessage(messages.seek),
  Settings: intl.formatMessage(messages.settings),
  'Skip To Live': intl.formatMessage(messages.skipToLive),
  Speed: intl.formatMessage(messages.speed),
  Size: intl.formatMessage(messages.size),
  Color: intl.formatMessage(messages.color),
  Opacity: intl.formatMessage(messages.opacity),
  Shadow: intl.formatMessage(messages.shadow),
  Text: intl.formatMessage(messages.text),
  'Text Background': intl.formatMessage(messages.textBackground),
  Track: intl.formatMessage(messages.track),
  Unmute: intl.formatMessage(messages.unmute),
  Volume: intl.formatMessage(messages.volume),
});

const generateVideoSources = (
  videoName: string = 'presentation',
): MediaSrc[] => [
  {
    src: `https://storage.openagenda.com/assets/videos/${videoName}/manifest.mpd`,
    type: 'application/dash+xml',
  },
  {
    src: `https://storage.openagenda.com/assets/videos/${videoName}/master.m3u8`,
    type: 'application/vnd.apple.mpegurl',
  },
];

// Mapping des vidéos avec informations prédéfinies
const videoMapping: Record<
  string,
  { title: string; sources?: MediaSrc[]; poster?: string }
> = {
  presentation: {
    title: "Présentation d'OpenAgenda",
    // poster: 'https://storage.openagenda.com/assets/videos/presentation/cover.png',
  },
};

const MultiFormatVideoPlayer = ({
  title,
  poster,
  video = 'presentation',
  sources,
}: VideoPlayerProps) => {
  const player = useRef<MediaPlayerInstance>(null);
  const intl = useIntl();

  const videoInfo = videoMapping[video];

  const videoSources =
    sources || videoInfo?.sources || generateVideoSources(video);
  const videoTitle = title || videoInfo?.title;
  const videoPoster = poster || videoInfo?.poster;

  function onProviderChange(
    provider: MediaProviderAdapter | null,
    _nativeEvent: MediaProviderChangeEvent,
  ) {
    if (isHLSProvider(provider)) {
      provider.library = () => import('hls.js');
      provider.config = {};
    } else if (isDASHProvider(provider)) {
      // v5 is not supported yet: https://github.com/vidstack/player/issues/1585
      provider.library = () => import('dashjs');
      provider.config = {};
    }
  }

  return (
    <StyledMediaPlayer
      ref={player}
      title={videoTitle}
      src={videoSources}
      poster={videoPoster}
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      className={styles.player}
      crossOrigin=""
      playsInline
      onProviderChange={onProviderChange}
      css={{
        '--brand-color': 'colors.primary.500',
      }}
    >
      <MediaProvider>
        {videoPoster && (
          <Poster className="vds-poster" src={videoPoster} alt={videoTitle} />
        )}
        {/* Ajoutez vos tracks de sous-titres ici si nécessaire */}
        {/* <Track src="path/to/subtitles.vtt" kind="subtitles" label="Français" lang="fr" /> */}
      </MediaProvider>

      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        thumbnails="https://storage.openagenda.com/assets/videos/presentation/thumbnails_webp_sprite.vtt"
        translations={getVideoTranslations(intl)}
        colorScheme="light"
        noModal
      />
    </StyledMediaPlayer>
  );
};

export default MultiFormatVideoPlayer;
