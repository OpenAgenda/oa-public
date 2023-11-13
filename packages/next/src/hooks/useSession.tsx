import { useCookies } from 'react-cookie';
import base64 from 'utils/base64';

export default function useSession() {
  const [cookies] = useCookies();

  if (!cookies.oa) {
    return null;
  }

  return JSON.parse(base64.decode(cookies.oa));
}
