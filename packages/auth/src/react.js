import { createAuthClient } from 'better-auth/react';

export { createAuthClient };

// React flavor exposes `useSession()` reactively (atom-backed). Same origin
// assumption as `./client`.
export const authClient = createAuthClient();

export default authClient;
