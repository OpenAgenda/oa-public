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

  const value = useMemo(
    () => ({
      isEmbedFirstLoad,
      initPath,
      initQuery: initPath ? parseLocationQuery(initPath) : {},
    }),
    [initPath, isEmbedFirstLoad],
  );

  return (
    <EmbedLayoutDataProvider value={value}>{children}</EmbedLayoutDataProvider>
  );
}
