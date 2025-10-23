import { useRef, useState, useEffect } from 'react';
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
import useMatomoVideoTracker from 'hooks/useMatomoVideoTracker';
import getVideoTranslations from './getVideoTranslations';

// import '@vidstack/react/player/styles/default/theme.css';
// import '@vidstack/react/player/styles/default/layouts/video.css';
import styles from './VideoPlayer.module.scss';

const StyledMediaPlayer = chakra(MediaPlayer);

interface VideoPlayerProps {
  video?: string;
  sources?: MediaSrc[];
  title?: string;
  poster?: string;
  thumbnails?: string;
}

const getSourceUrl = (source: MediaSrc | undefined): string => {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && typeof source.src === 'string')
    return source.src;
  return '';
};

const generateVideoSources = (
  videoName: string = 'presentation',
): MediaSrc[] => [
  {
    src: `https://cdn.openagenda.com/assets/videos/${videoName}/manifest.mpd`,
    type: 'application/dash+xml',
  },
  {
    src: `https://cdn.openagenda.com/assets/videos/${videoName}/master.m3u8`,
    type: 'application/vnd.apple.mpegurl',
  },
];

// Mapping des vidéos avec informations prédéfinies
const videoMapping: Record<
  string,
  { title: string; sources?: MediaSrc[]; poster?: string; thumbnails?: string }
> = {
  presentation: {
    title: "Présentation d'OpenAgenda",
    poster: 'https://cdn.openagenda.com/main/poster-pres-oa-video-4.svg',
    thumbnails:
      'https://cdn.openagenda.com/assets/videos/presentation/thumbnails_webp_sprite.vtt',
  },
};

const MultiFormatVideoPlayer = ({
  video = 'presentation',
  sources,
  title,
  poster,
  thumbnails,
}: VideoPlayerProps) => {
  const player = useRef<MediaPlayerInstance>(null);
  const intl = useIntl();
  const matomoVideoTracker = useMatomoVideoTracker();
  const [trackedPercentages, setTrackedPercentages] = useState<Set<number>>(
    new Set(),
  );

  const videoInfo = videoMapping[video];

  const videoSources =
    sources || videoInfo?.sources || generateVideoSources(video);
  const videoTitle = title || videoInfo?.title;
  const videoPoster = poster || videoInfo?.poster;
  const videoThumbnails = thumbnails || videoInfo?.thumbnails;

  useEffect(() => {
    matomoVideoTracker.trackContentImpression({
      videoTitle,
      videoUrl: getSourceUrl(videoSources[0]),
    });
  }, [matomoVideoTracker, videoSources, videoTitle]);

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

  const handleVideoPlay = () => {
    matomoVideoTracker.trackVideoPlay({
      videoTitle,
      videoUrl: getSourceUrl(videoSources[0]),
      position: player.current?.currentTime || 0,
    });
  };

  const handleVideoPause = () => {
    matomoVideoTracker.trackVideoPause({
      videoTitle,
      videoUrl: getSourceUrl(videoSources[0]),
      position: player.current?.currentTime || 0,
    });
  };

  const handleVideoSeek = () => {
    matomoVideoTracker.trackVideoSeek({
      videoTitle,
      videoUrl: getSourceUrl(videoSources[0]),
      position: player.current?.currentTime || 0,
    });
  };

  const handleVideoEnd = () => {
    matomoVideoTracker.trackVideoComplete({
      videoTitle,
      videoUrl: getSourceUrl(videoSources[0]),
      position: player.current?.currentTime || 0,
    });
  };

  const handleTimeUpdate = () => {
    const currentTime = player.current?.currentTime || 0;
    const duration = player.current?.duration || 0;

    if (duration > 0) {
      const percentage = Math.floor((currentTime / duration) * 100);
      if (
        [25, 50, 75].includes(percentage) &&
        !trackedPercentages.has(percentage)
      ) {
        setTrackedPercentages((prev) => new Set([...prev, percentage]));

        matomoVideoTracker.trackVideoProgress({
          videoTitle,
          videoUrl: getSourceUrl(videoSources[0]),
          position: currentTime,
          percentage,
        });
      }
    }
  };

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
      onPlay={handleVideoPlay}
      onPause={handleVideoPause}
      onSeeking={handleVideoSeek}
      onEnded={handleVideoEnd}
      onTimeUpdate={handleTimeUpdate}
      css={{
        '--brand-color': 'colors.primary.500',
        '--video-load-button-bg': 'rgba(255, 255, 255, 0.8)',
        '& .vds-poster': {
          height: 'auto',
        },
      }}
      load="play"
      posterLoad="visible"
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
        thumbnails={videoThumbnails}
        translations={getVideoTranslations(intl)}
        colorScheme="light"
        noModal
      />
    </StyledMediaPlayer>
  );
};

export default MultiFormatVideoPlayer;
