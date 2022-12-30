import { useMemo } from 'react';
import { useRouter } from 'next/router';
import pick from 'lodash/pick';
import getRouteParamKeys from 'utils/getRouteParamKeys';

type Params = Record<string, string | string[]>;

export default function useRouteParams(): Params {
  const router = useRouter();
  return useMemo(
    () => pick(router.query, getRouteParamKeys(router.route)),
    [router.route, router.query],
  );
}
