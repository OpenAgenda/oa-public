import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useSessionStorageState from 'use-session-storage-state';
import qs from 'qs';
import { parseToHsla } from 'color2k';
import {
  EmotionCache,
  extendTheme,
  theme as defaultTheme,
  UIKitProvider,
  useConst,
} from '@openagenda/uikit';
import useSyncUrlWithParent from 'hooks/useSyncUrlWithParent';
import useIsFirstRender from 'hooks/useIsFirstRender';
import { createContext } from 'utils/createContext';
import parseLocationQuery from 'utils/parseLocationQuery';
import createColorPalette from 'utils/colorPalette';
import useLocationQuery from '../hooks/useLocationQuery';

type LayoutProps = {
  children: React.ReactNode;
  emotionCache?: EmotionCache;
};

type EmbedLayoutDataValue = {
  isEmbedFirstLoad: boolean;
  initPath: string | null;
  initQuery: Record<string, any>;
  baseUrl: string | undefined;
  prefilter: Record<string, any>;
  query: Record<string, any>;
  setQuery: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  primaryColor: string | undefined;
  secondaryColor: string | undefined;
};

export const [EmbedLayoutDataProvider, useEmbedLayoutData] = createContext<EmbedLayoutDataValue>({
  strict: true,
  name: 'EmbedLayoutDataContext',
  hookName: 'useEmbedLayoutData',
  providerName: 'EmbedLayoutDataProvider',
});

function isValidColor(value: string): boolean {
  try {
    parseToHsla(value);
    return true;
  } catch {
    return false;
  }
}

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
    }));
}

export default function EmbedLayout({ children, emotionCache }: LayoutProps) {
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

  const primaryColor = useConst(() => {
    const color = (
      initPath ? initQuery.primaryColor : router.query.primaryColor
    ) as string;
    return isValidColor(color) ? color : null;
  });

  const secondaryColor = useConst(() => {
    const color = (
      initPath ? initQuery.secondaryColor : router.query.secondaryColor
    ) as string;
    return isValidColor(color) ? color : null;
  });

  const [query, setQuery] = useState<Record<string, any>>(() => ({
    ...initPath ? urlQuery : {},
    baseUrl: undefined,
    filters: undefined,
    initPath: undefined,
    primaryColor: undefined,
    secondaryColor: undefined,
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
        primaryColor: undefined,
        secondaryColor: undefined,
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

  const theme = useEmbedTheme({ primaryColor, secondaryColor });

  const value = useMemo<EmbedLayoutDataValue>(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery,
      baseUrl,
      prefilter,
      query,
      setQuery,
      primaryColor,
      secondaryColor,
    }),
    [
      isEmbedFirstLoad,
      initPath,
      initQuery,
      baseUrl,
      prefilter,
      query,
      primaryColor,
      secondaryColor,
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
