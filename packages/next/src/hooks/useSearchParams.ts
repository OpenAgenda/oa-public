import { useMemo } from 'react';
import { useRouter } from 'next/router';
import getSearchParams from 'utils/getSearchParams';

type Params = Record<string, string | string[]>;

export default function useSearchParams(): Params {
  const router = useRouter();
  return useMemo(
    () => getSearchParams(router.route, router.query),
    [router.route, router.query],
  );
}
