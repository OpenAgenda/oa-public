import { createAuthClient } from 'better-auth/react';
import { customSessionClient } from 'better-auth/client/plugins';

export { createAuthClient, customSessionClient };

// React flavor exposes `useSession()` reactively (atom-backed). Same origin
// assumption as `./client`.
export const authClient = createAuthClient({
  plugins: [customSessionClient()],
});

export default authClient;
