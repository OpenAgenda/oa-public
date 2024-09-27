import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useConst } from '@openagenda/uikit';
import useSyncUrlWithParent from 'hooks/useSyncUrlWithParent';
import useIsFirstRender from 'hooks/useIsFirstRender';
import { createContext } from 'utils/createContext';
import parseLocationQuery from 'utils/parseLocationQuery';

type LayoutProps = {
  children: React.ReactNode;
};

type EmbedLayoutDataValue = {
  isEmbedFirstLoad: boolean;
  initPath: string | null;
  initQuery: Record<string, any>;
  baseUrl: string | undefined;
};

export const [EmbedLayoutDataProvider, useEmbedLayoutData] = createContext<EmbedLayoutDataValue>({
  strict: true,
  name: 'EmbedLayoutDataContext',
  hookName: 'useEmbedLayoutData',
  providerName: 'EmbedLayoutDataProvider',
});

export default function EmbedLayout({ children }: LayoutProps) {
  const router = useRouter();

  useSyncUrlWithParent();

  const isEmbedFirstLoad = useIsFirstRender();

  const initPath = useConst(() =>
    (router.query.initPath?.length ? (router.query.initPath as string) : null));

  const initQuery = useConst(() =>
    (initPath ? parseLocationQuery(initPath) : {}));

  const baseUrl = useConst(
    () => (initPath ? initQuery.baseUrl : router.query.baseUrl) as string,
  );

  const value = useMemo(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery,
      baseUrl,
    }),
    [isEmbedFirstLoad, initPath, initQuery, baseUrl],
  );

  return (
    <EmbedLayoutDataProvider value={value}>{children}</EmbedLayoutDataProvider>
  );
}
