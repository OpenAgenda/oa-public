import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useSessionStorageState from 'use-session-storage-state';
import qs from 'qs';
import {
  EmotionCache,
  extendTheme,
  theme as defaultTheme,
  UIKitProvider,
  useConst,
} from '@openagenda/uikit';
import useSyncUrlWithParent from 'hooks/useSyncUrlWithParent';
import useIsFirstRender from 'hooks/useIsFirstRender';
import useLocationQuery from 'hooks/useLocationQuery';
import { createContext } from 'utils/createContext';
import parseLocationQuery from 'utils/parseLocationQuery';
import { extractParams, omitParams, type EmbedParams } from 'utils/embedParams';
import createColorPalette from 'utils/colorPalette';

type LayoutProps = {
  children: React.ReactNode;
  emotionCache?: EmotionCache;
};

type EmbedLayoutDataValue = {
  isEmbedFirstLoad: boolean;
  initPath: string | null;
  initQuery: Record<string, any>;
  prefilter: Record<string, any>;
  query: Record<string, any>;
  setQuery: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  referrer: string;
  setReferrer: React.Dispatch<React.SetStateAction<string>>;
} & EmbedParams;

export const [EmbedLayoutDataProvider, useEmbedLayoutData] =
  createContext<EmbedLayoutDataValue>({
    strict: true,
    name: 'EmbedLayoutDataContext',
    hookName: 'useEmbedLayoutData',
    providerName: 'EmbedLayoutDataProvider',
  });

function useEmbedTheme({ primaryColor, secondaryColor }) {
  const primaryColorPalette = primaryColor
    ? createColorPalette({ value: primaryColor })
    : defaultTheme.colors.primary;
  const secondaryColorPalette = secondaryColor
    ? createColorPalette({ value: secondaryColor })
    : null;

  return useConst(() =>
    extendTheme(defaultTheme, {
      styles: {
        global: {
          body: {
            bg: null,
          },
        },
      },
      colors: {
        primary: primaryColorPalette,
        secondary: secondaryColorPalette,
      },
    }),
  );
}

export default function EmbedLayout({ children, emotionCache }: LayoutProps) {
  const router = useRouter();
  const urlQuery = useLocationQuery();

  useSyncUrlWithParent();

  const isEmbedFirstLoad = useIsFirstRender();

  const initPath = useConst(() =>
    router.query.initPath?.length ? (router.query.initPath as string) : null,
  );

  const initQuery = useConst(() =>
    initPath ? parseLocationQuery(initPath) : {},
  );

  const embedParams = useConst(() =>
    extractParams(
      (initPath ? initQuery : router.query) as Record<string, string>,
    ),
  );

  const [query, setQuery] = useState<Record<string, any>>(() =>
    omitParams(initPath ? urlQuery : {}),
  );

  const [referrer, setReferrer] = useState<string>('');

  const [prefilter, setStoredPrefilter] = useSessionStorageState('prefilter', {
    defaultValue: initPath ? initQuery : urlQuery,
  });

  useEffect(() => {
    if (isEmbedFirstLoad) {
      setStoredPrefilter(initPath ? initQuery : urlQuery);

      const newUrl =
        new URL(router.asPath, 'https://n').pathname +
        qs.stringify(omitParams(query), { addQueryPrefix: true });

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

  const theme = useEmbedTheme({
    primaryColor: embedParams.primaryColor,
    secondaryColor: embedParams.secondaryColor,
  });

  const value = useMemo<EmbedLayoutDataValue>(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery,
      prefilter,
      query,
      setQuery,
      referrer,
      setReferrer,
      ...embedParams,
    }),
    [
      isEmbedFirstLoad,
      initPath,
      initQuery,
      prefilter,
      query,
      referrer,
      embedParams,
    ],
  );

  return (
    <EmbedLayoutDataProvider value={value}>
      <UIKitProvider theme={theme} cache={emotionCache}>
        {children}
      </UIKitProvider>
    </EmbedLayoutDataProvider>
  );
}
