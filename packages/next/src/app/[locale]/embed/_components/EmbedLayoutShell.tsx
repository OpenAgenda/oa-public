'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import useSessionStorageState from 'use-session-storage-state';
import qs from 'qs';
import { getContrast } from 'color2k';
import {
  ChakraProvider,
  createSystem,
  theme as defaultTheme,
  useConst,
} from '@openagenda/uikit';
import ky from 'ky';
import { useLatest } from 'react-use';
import useIsFirstRender from 'hooks/useIsFirstRender';
import useParentCommunication from 'hooks/useParentCommunication';
import { createContext } from 'utils/createContext';
import parseLocationQuery from 'utils/parseLocationQuery';
import { embedAgendaUrlRegex } from 'utils/isNextUrl';
import { extractParams, omitParams, type EmbedParams } from 'utils/embedParams';
import createColorPalette from 'utils/colorPalette';

type LayoutProps = {
  children: React.ReactNode;
};

type EmbedLayoutDataValue = {
  isEmbedFirstLoad: boolean;
  initPath: string | null;
  initQuery: Record<string, any>;
  prefilter: Record<string, any>;
  query: Record<string, any>;
  setQuery: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  referrer: string;
  setReferrer: React.Dispatch<React.SetStateAction<string | null>>;
  themeConfig: any;
} & EmbedParams;

export const [EmbedLayoutDataProvider, useEmbedLayoutData] =
  createContext<EmbedLayoutDataValue>({
    strict: true,
    name: 'EmbedLayoutDataContext',
    hookName: 'useEmbedLayoutData',
    providerName: 'EmbedLayoutDataProvider',
  });

function getContrastingColor(color: string) {
  return getContrast(color, '#fff') > getContrast(color, '#000')
    ? '#fff'
    : '#000';
}

function useEmbedThemeConfig({
  primaryColor,
  secondaryColor,
}: {
  primaryColor?: string;
  secondaryColor?: string;
}) {
  return useConst(() => {
    const primaryColorPalette = primaryColor
      ? createColorPalette({ value: primaryColor })
      : defaultTheme._config.theme.tokens.colors.primary;
    const secondaryColorPalette = secondaryColor
      ? createColorPalette({ value: secondaryColor })
      : undefined;

    const primaryContrast = primaryColor
      ? getContrastingColor(primaryColor)
      : 'white';
    const secondaryContrast = secondaryColor
      ? getContrastingColor(secondaryColor)
      : undefined;

    return {
      globalCss: {
        html: {
          bg: null,
        },
        body: {
          minH: 0,
        },
      },
      theme: {
        tokens: {
          colors: {
            primary: primaryColorPalette,
            secondary: secondaryColorPalette,
            primaryContrast: { value: primaryContrast },
            secondaryContrast: { value: secondaryContrast },
          },
        },
      },
    };
  });
}

function useEmbedTheme(config: any) {
  return useConst(() => createSystem(defaultTheme._config, config));
}

function removeHostQuery(urlString: string): string {
  const url = new URL(urlString, 'https://n');
  url.searchParams.delete('host');
  return url.pathname + url.search;
}

async function handleParentRequest({
  action,
  payload,
}: {
  action: string;
  payload: any;
}) {
  switch (action) {
    case 'fetchAgendaExportSettings':
      return ky(`/agendas/${payload.agendaUid}/settings/exports`).json();
    default:
      throw new Error('Unknown action: ' + action);
  }
}

function useSyncUrlWithParent(asPath: string) {
  const { handleParentResponse } = useParentCommunication();
  const latestAsPath = useLatest(asPath);
  const previousAsPath = useRef<string | null>(null);

  useEffect(() => {
    const onMessage = (message: any) => {
      if (message?.type === 'request') {
        handleParentRequest(message).then(
          (result) => {
            if ('parentIFrame' in window) {
              (window as any).parentIFrame.sendMessage({
                type: 'response',
                id: message.id,
                result,
              });
            }
          },
          (err) => {
            if ('parentIFrame' in window) {
              (window as any).parentIFrame.sendMessage({
                type: 'response',
                id: message.id,
                error: String(err),
              });
            }
          },
        );
      }

      handleParentResponse(message);
    };

    if (typeof window !== 'undefined') {
      (window as any).iFrameResizer = {
        ignoreSelector: '.leaflet-proxy.leaflet-zoom-animated',
        onMessage,
      };

      import('@iframe-resizer/child');
    }
  }, [handleParentResponse, latestAsPath]);

  useEffect(() => {
    // Skip the first render so we don't message the parent on initial mount
    // — mirrors the `isFirstLoad` guard of the legacy Pages Router hook.
    if (previousAsPath.current === null) {
      previousAsPath.current = asPath;
      return;
    }
    if (previousAsPath.current === asPath) return;
    previousAsPath.current = asPath;

    if (!('parentIFrame' in window)) return;

    const url = removeHostQuery(asPath);
    const urlWithoutLocale = url.replace(/^\/[^/]+\//, '/');
    if (embedAgendaUrlRegex.test(urlWithoutLocale) && !/\?.+/.test(url)) {
      (window as any).parentIFrame.sendMessage({ type: 'urlChange', url: '' });
    } else {
      (window as any).parentIFrame.sendMessage({ type: 'urlChange', url });
    }

    (window as any).parentIFrame.scrollToOffset?.(0, 0);
  }, [asPath]);
}

export default function EmbedLayoutShell({ children }: LayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchString = searchParams.toString();
  const asPath = searchString ? `${pathname}?${searchString}` : pathname;

  const urlQuery = useMemo(
    () => (searchString ? qs.parse(searchString) : {}),
    [searchString],
  );

  useSyncUrlWithParent(asPath);

  const isEmbedFirstLoad = useIsFirstRender();

  const initPath = useConst(() => {
    const p = searchParams.get('initPath');
    return p && p.length ? p : null;
  });

  const initQuery = useConst(() =>
    initPath ? parseLocationQuery(initPath) : {},
  );

  const embedParams = useConst(() =>
    extractParams(
      (initPath ? initQuery : qs.parse(searchString)) as Record<string, string>,
    ),
  );

  const [query, setQuery] = useState<Record<string, any>>(() =>
    omitParams(initPath ? urlQuery : {}),
  );

  const [referrer, setReferrer] = useState<string>();

  const [prefilter, setStoredPrefilter] = useSessionStorageState('prefilter', {
    defaultValue: initPath ? initQuery : urlQuery,
  });

  useEffect(() => {
    if (!isEmbedFirstLoad) return;
    setStoredPrefilter(initPath ? initQuery : urlQuery);

    const stripped = qs.stringify(omitParams(query), {
      addQueryPrefix: true,
    });
    const newUrl = `${pathname}${stripped}`;

    // history.replaceState vs router.replace to avoid an RSC refetch on mount
    // (router.* triggers full navigation in App Router). useSearchParams
    // observes history changes since Next 14.1.
    window.history.replaceState(null, '', newUrl);
  }, [
    isEmbedFirstLoad,
    setStoredPrefilter,
    initQuery,
    initPath,
    urlQuery,
    pathname,
    query,
  ]);

  const themeConfig = useEmbedThemeConfig({
    primaryColor: embedParams.primaryColor,
    secondaryColor: embedParams.secondaryColor,
  });
  const theme = useEmbedTheme(themeConfig);

  const value = useMemo<EmbedLayoutDataValue>(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery,
      prefilter,
      query,
      setQuery,
      referrer: referrer ?? '',
      setReferrer: setReferrer as React.Dispatch<
        React.SetStateAction<string | null>
      >,
      themeConfig,
      pageSize: 12,
      ...embedParams,
    }),
    [
      isEmbedFirstLoad,
      initPath,
      initQuery,
      prefilter,
      query,
      referrer,
      themeConfig,
      embedParams,
    ],
  );

  return (
    <EmbedLayoutDataProvider value={value}>
      {/* Only override the Chakra theme — reuse the ambient emotion cache
          from the root `AppProviders` so SSR styles get flushed via its
          useServerInsertedHTML hook. Wrapping in a nested UIKitProvider
          would open a separate cache whose styles never reach the HTML. */}
      <ChakraProvider value={theme}>{children}</ChakraProvider>
    </EmbedLayoutDataProvider>
  );
}
