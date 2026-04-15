import { cache } from 'react';
import { headers } from 'next/headers';

const getNonce = cache(async (): Promise<string | null> => {
  const headersList = await headers();
  return headersList.get('x-nonce');
});

export default getNonce;
