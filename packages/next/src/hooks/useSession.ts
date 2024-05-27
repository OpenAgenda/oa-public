import { useMemo } from 'react';
import { useCookies } from 'react-cookie';
import base64 from 'utils/base64';

const COOKIE_NAME = 'oa.user';

export default function useSession() {
  const [cookies] = useCookies();

  return useMemo(() => {
    if (!cookies[COOKIE_NAME]) return null;
    return JSON.parse(base64.decode(cookies[COOKIE_NAME]));
  }, [cookies[COOKIE_NAME]]);
}
