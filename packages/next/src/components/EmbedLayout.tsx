import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useSessionStorageState from 'use-session-storage-state';
import qs from 'qs';
import { useConst } from '@openagenda/uikit';
import useSyncUrlWithParent from 'hooks/useSyncUrlWithParent';
import useIsFirstRender from 'hooks/useIsFirstRender';
import { createContext } from 'utils/createContext';
import parseLocationQuery from 'utils/parseLocationQuery';
import useLocationQuery from '../hooks/useLocationQuery';

type LayoutProps = {
  children: React.ReactNode;
};

type EmbedLayoutDataValue = {
  isEmbedFirstLoad: boolean;
  initPath: string | null;
  initQuery: Record<string, any>;
  baseUrl: string | undefined;
  prefilter: Record<string, any>;
  query: Record<string, any>;
  setQuery: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

export const [EmbedLayoutDataProvider, useEmbedLayoutData] = createContext<EmbedLayoutDataValue>({
  strict: true,
  name: 'EmbedLayoutDataContext',
  hookName: 'useEmbedLayoutData',
  providerName: 'EmbedLayoutDataProvider',
});

export default function EmbedLayout({ children }: LayoutProps) {
  const router = useRouter();
  const urlQuery = useLocationQuery();

  useSyncUrlWithParent();

  const isEmbedFirstLoad = useIsFirstRender();

  const initPath = useConst(() =>
    (router.query.initPath?.length ? (router.query.initPath as string) : null));

  const initQuery = useConst(() =>
    (initPath ? parseLocationQuery(initPath) : {}));

  const baseUrl = useConst(
    () => (initPath ? initQuery.baseUrl : router.query.baseUrl) as string,
  );

  const [query, setQuery] = useState<Record<string, any>>(() => ({
    ...initPath ? urlQuery : {},
    baseUrl: undefined,
    filters: undefined,
    initPath: undefined,
  }));

  const [prefilter, setStoredPrefilter] = useSessionStorageState('prefilter', {
    defaultValue: initPath ? initQuery : urlQuery,
  });

  useEffect(() => {
    if (isEmbedFirstLoad) {
      setStoredPrefilter(initPath ? initQuery : urlQuery);

      const newQuery = {
        ...query,
        baseUrl: undefined,
        filters: undefined,
        initPath: undefined,
      };
      const newUrl = new URL(router.asPath, 'https://n').pathname
        + qs.stringify(newQuery, { addQueryPrefix: true });

      router.replace(newUrl, null, { shallow: true });
    }
  }, [
    isEmbedFirstLoad,
    setStoredPrefilter,
    initQuery,
    initPath,
    urlQuery,
    router,
    query,
  ]);

  const value = useMemo<EmbedLayoutDataValue>(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery,
      baseUrl,
      prefilter,
      query,
      setQuery,
    }),
    [isEmbedFirstLoad, initPath, initQuery, baseUrl, prefilter, query],
  );

  return (
    <EmbedLayoutDataProvider value={value}>{children}</EmbedLayoutDataProvider>
  );
}
