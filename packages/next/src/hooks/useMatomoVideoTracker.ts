import { useCallback, useRef } from 'react';
import {
  getOpenAgendaTracker,
  executeWhenMatomoReady,
} from 'utils/addMatomoTracker';

interface VideoEventData {
  videoTitle?: string;
  videoUrl?: string;
  position?: number;
}

export default function useMatomoVideoTracker() {
  const pendingImpressions = useRef<VideoEventData[]>([]);
  const pendingInteractions = useRef<VideoEventData[]>([]);

  const trackContentImpressionWhenReady = useCallback(
    (data: VideoEventData) => {
      const doTrack = () => {
        try {
          const tracker = getOpenAgendaTracker();
          tracker.trackContentImpression(
            data.videoTitle || 'video', // Nom du contenu
            'video', // Type de contenu
            data.videoUrl || window.location.href, // URL du contenu
          );
        } catch (error) {
          console.warn(
            "Erreur lors du tracking d'impression de contenu Matomo:",
            error,
          );
        }
      };

      executeWhenMatomoReady(doTrack);
    },
    [],
  );

  const trackContentImpression = useCallback(
    (data: VideoEventData) => {
      const key = `${data.videoTitle}_${data.videoUrl}`;
      if (
        !pendingImpressions.current.find(
          (item) => `${item.videoTitle}_${item.videoUrl}` === key,
        )
      ) {
        pendingImpressions.current.push(data);
        trackContentImpressionWhenReady(data);
      }
    },
    [trackContentImpressionWhenReady],
  );

  const trackContentInteractionOnce = useCallback((data: VideoEventData) => {
    const key = `${data.videoTitle}_${data.videoUrl}`;
    if (
      !pendingInteractions.current.find(
        (item) => `${item.videoTitle}_${item.videoUrl}` === key,
      )
    ) {
      pendingInteractions.current.push(data);

      const doTrack = () => {
        try {
          const tracker = getOpenAgendaTracker();
          if (tracker) {
            tracker.trackContentInteraction(
              'play',
              data.videoTitle || 'video',
              'video',
              data.videoUrl || window.location.href,
            );
          }
        } catch (error) {
          console.warn(
            "Erreur lors du tracking d'interaction de contenu Matomo:",
            error,
          );
        }
      };

      executeWhenMatomoReady(doTrack);
    }
  }, []);

  const trackVideoEvent = useCallback(
    (action: string, data: VideoEventData = {}) => {
      const doTrack = () => {
        try {
          const tracker = getOpenAgendaTracker();
          if (tracker) {
            tracker.trackEvent(
              'Video',
              action,
              data.videoTitle || 'Unknown Video',
              data.position || 0,
            );

            if (action === 'Play' || action === 'Resume') {
              trackContentInteractionOnce(data);
            }
          }
        } catch (error) {
          console.warn('Erreur lors du tracking vidéo Matomo:', error);
        }
      };

      executeWhenMatomoReady(doTrack);
    },
    [trackContentInteractionOnce],
  );

  const trackVideoPlay = useCallback(
    (data: VideoEventData) => {
      trackVideoEvent('Play', data);
    },
    [trackVideoEvent],
  );

  const trackVideoPause = useCallback(
    (data: VideoEventData) => {
      trackVideoEvent('Pause', data);
    },
    [trackVideoEvent],
  );

  const trackVideoSeek = useCallback(
    (data: VideoEventData) => {
      trackVideoEvent('Seek', data);
    },
    [trackVideoEvent],
  );

  const trackVideoComplete = useCallback(
    (data: VideoEventData) => {
      trackVideoEvent('Complete', data);
    },
    [trackVideoEvent],
  );

  const trackVideoProgress = useCallback(
    (data: VideoEventData & { percentage: number }) => {
      const { percentage, ...videoData } = data;
      trackVideoEvent(`Progress ${percentage}%`, videoData);
    },
    [trackVideoEvent],
  );

  return {
    trackContentImpression,
    trackVideoEvent,
    trackVideoPlay,
    trackVideoPause,
    trackVideoSeek,
    trackVideoComplete,
    trackVideoProgress,
  };
}
