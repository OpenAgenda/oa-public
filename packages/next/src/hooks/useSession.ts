'use client';

import { authClient } from '@openagenda/auth/react';

export default function useSession() {
  const { data } = authClient.useSession();
  return data ?? null;
}
