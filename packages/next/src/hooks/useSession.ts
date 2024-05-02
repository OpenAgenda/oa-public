import { useMemo } from 'react';
import { useCookies } from 'react-cookie';
import base64 from 'utils/base64';

export default function useSession() {
  const [cookies] = useCookies();

  return useMemo(() => {
    if (!cookies.oa) return null;
    return JSON.parse(base64.decode(cookies.oa));
  }, [cookies.oa]);
}
