import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLatest } from 'react-use';

export default function useSyncUrlWithParent() {
  const router = useRouter();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const latestRouter = useLatest(router);

  useLayoutEffect(() => {
    const onMessage = (message) => {
      if (message.type === 'urlChange') {
        const { newUrl } = message;
        const routerPath = `/${latestRouter.current.locale}${latestRouter.current.asPath}`;

        if (routerPath === newUrl) return;

        router.push(newUrl, null, { shallow: true });
      }
    };

    window.iFrameResizer = { onMessage };

    import('@iframe-resizer/child');
  }, [latestRouter]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (isFirstLoad) {
        setIsFirstLoad(false);
      } else if ('parentIframe' in window) {
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
