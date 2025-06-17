import { useCallback } from 'react';

declare const window: {
  Matomo?: any;
} & Window;

interface VideoEventData {
  videoTitle?: string;
  videoUrl?: string;
  position?: number;
  duration?: number;
}

export default function useMatomoVideoTracker() {
  const trackContentImpression = useCallback((data: VideoEventData) => {
    try {
      if (window.Matomo?.getTracker) {
        const tracker = window.Matomo.getTracker();

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
        if (window.Matomo?.getTracker) {
          const tracker = window.Matomo.getTracker();

          tracker.trackEvent(
            'Video',
            action,
            data.videoTitle || 'Unknown Video',
            data.position || 0,
          );

          // Pour les interactions de contenu, on doit d'abord déclarer le contenu
          if (action === 'Play' || action === 'Resume') {
            // S'assurer que le contenu est déclaré
            tracker.trackContentImpression(
              data.videoTitle || 'video',
              'video',
              data.videoUrl || window.location.href,
            );

            // Puis tracker l'interaction
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
