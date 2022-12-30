import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ParsedQs } from 'qs';
import parseLocationQuery from 'utils/parseLocationQuery';

export default function useLocationQuery(): ParsedQs {
  const router = useRouter();
  return useMemo(
    () => parseLocationQuery(router.asPath),
    [router.asPath],
  );
}
