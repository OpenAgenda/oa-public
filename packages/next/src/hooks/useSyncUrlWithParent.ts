import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLatest } from 'react-use';
import { embedAgendaUrlRegex } from '../utils/isNextUrl';

function removeHostQuery(urlString: string): string {
  const url = new URL(urlString, 'https://n');
  url.searchParams.delete('host');
  return url.pathname + url.search;
}

export default function useSyncUrlWithParent() {
  const router = useRouter();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const latestRouter = useLatest(router);

  useLayoutEffect(() => {
    // Useless for now;
    // const onMessage = (message) => {
    //   if (message.type === 'urlChange') {
    //     const { newUrl } = message;
    //     const routerPath = `/${latestRouter.current.locale}${latestRouter.current.asPath}`;
    //
    //     if (routerPath === newUrl) return;
    //
    //     router.push(newUrl, null, { shallow: true });
    //   }
    // };

    window.iFrameResizer = {
      ignoreSelector: '.leaflet-proxy.leaflet-zoom-animated',
      // sizeSelector: 'body',
      // onMessage
    };

    import('@iframe-resizer/child');
  }, [latestRouter]);

  useEffect(() => {
    const handleRouteChange = (urlArg: string) => {
      if (isFirstLoad) {
        setIsFirstLoad(false);
      } else if ('parentIframe' in window) {
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
    if ('parentIframe' in window) {
      window.parentIFrame.scrollToOffset(0, 0);
    }
  }, [router.route]);
}
