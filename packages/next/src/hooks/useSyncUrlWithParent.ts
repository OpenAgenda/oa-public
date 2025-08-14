import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLatest } from 'react-use';
import ky from 'ky';
import { embedAgendaUrlRegex } from '../utils/isNextUrl';

function removeHostQuery(urlString: string): string {
  const url = new URL(urlString, 'https://n');
  url.searchParams.delete('host');
  return url.pathname + url.search;
}

type ParentRequest = {
  id: string;
  action: string;
  payload: any;
};

async function handleRequest({ action, payload }: ParentRequest) {
  switch (action) {
    case 'fetchAgendaExportSettings':
      return ky(`/agendas/${payload.agendaUid}/settings/exports`).json();
    default:
      throw new Error('Unknown action: ' + action);
  }
}

export default function useSyncUrlWithParent() {
  const router = useRouter();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const latestRouter = useLatest(router);

  useLayoutEffect(() => {
    const onMessage = (message) => {
      if (message?.type === 'request') {
        handleRequest(message).then(
          (result) => {
            if ('parentIFrame' in window) {
              window.parentIFrame.sendMessage({
                type: 'response',
                id: message.id,
                result,
              });
            }
          },
          (err) => {
            if ('parentIFrame' in window) {
              window.parentIFrame.sendMessage({
                type: 'response',
                id: message.id,
                error: String(err),
              });
            }
          },
        );
      }

      // Useless for now
      // if (message.type === 'urlChange') {
      //   const { newUrl } = message;
      //   const routerPath = `/${latestRouter.current.locale}${latestRouter.current.asPath}`;
      //
      //   if (routerPath === newUrl) return;
      //
      //   router.push(newUrl, null, { shallow: true });
      // }
    };

    if (typeof window !== 'undefined') {
      window.iFrameResizer = {
        ignoreSelector: '.leaflet-proxy.leaflet-zoom-animated',
        // sizeSelector: 'body',
        onMessage,
      };

      import('@iframe-resizer/child');
    }
  }, [latestRouter]);

  useEffect(() => {
    const handleRouteChange = (urlArg: string) => {
      if (isFirstLoad) {
        setIsFirstLoad(false);
      } else if ('parentIFrame' in window) {
        const url = removeHostQuery(urlArg);
        const urlWithoutLocale = url.replace(/^\/[^/]+\//, '/');
        if (
          embedAgendaUrlRegex.test(urlWithoutLocale) &&
          !/\?.+/.test(url) // no query
        ) {
          window.parentIFrame.sendMessage({ type: 'urlChange', url: '' });
          return;
        }

        window.parentIFrame.sendMessage({ type: 'urlChange', url });
      }
    };

    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    if ('parentIFrame' in window) {
      window.parentIFrame.scrollToOffset(0, 0);
    }
  }, [router.route]);
}
