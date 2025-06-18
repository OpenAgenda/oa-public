import { useCallback } from 'react';
import { getOpenAgendaTracker } from 'utils/addMatomoTracker';

declare const window: {
  Matomo?: any;
} & Window;

interface VideoEventData {
  videoTitle?: string;
  videoUrl?: string;
  position?: number;
}

export default function useMatomoVideoTracker() {
  const trackContentImpression = useCallback((data: VideoEventData) => {
    try {
      const tracker = getOpenAgendaTracker();
      if (tracker) {
        tracker.trackContentImpression(
          data.videoTitle || 'video', // Nom du contenu
          'video', // Type de contenu
          data.videoUrl || window.location.href, // URL du contenu
        );
      }
    } catch (error) {
      console.warn(
        "Erreur lors du tracking d'impression de contenu Matomo:",
        error,
      );
    }
  }, []);

  const trackVideoEvent = useCallback(
    (action: string, data: VideoEventData = {}) => {
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
            tracker.trackContentImpression(
              data.videoTitle || 'video',
              'video',
              data.videoUrl || window.location.href,
            );

            tracker.trackContentInteraction(
              'play',
              data.videoTitle || 'video',
              data.videoUrl || window.location.href,
            );
          }
        }
      } catch (error) {
        console.warn('Erreur lors du tracking vidéo Matomo:', error);
      }
    },
    [],
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
