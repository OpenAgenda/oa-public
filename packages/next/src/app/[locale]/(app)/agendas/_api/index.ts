import { cache } from 'react';
import { headers } from 'next/headers';
import ky from 'ky';
import qs from 'qs';

export type AgendasQuery = {
  search?: string;
  network?: string;
  locationSet?: string;
  after?: string[];
};

const getApi = cache(async () => {
  const headersList = await headers();

  return ky.create({
    prefixUrl: process.env.NEXT_API_INTERNAL_BASE_URL,
    headers: {
      Cookie: headersList.get('cookie') || '',
      Authorization: headersList.get('authorization') || '',
    },
  });
});

export async function fetchAgendas(query: AgendasQuery) {
  const api = await getApi();
  const searchString = qs.stringify(
    {
      ...query,
      after: query.after?.map(String),
      includeImagePath: 0,
      useDefaultImage: 0,
      fields: ['summary', 'network', 'locationSet'],
    },
    { addQueryPrefix: false },
  );

  return api.get(`api/agendas${searchString ? `?${searchString}` : ''}`).json();
}

export async function fetchNetwork(uid: string) {
  const api = await getApi();
  return api.get(`api/networks/${uid}`).json();
}

export async function fetchLocationSet(uid: string) {
  const api = await getApi();
  return api.get(`api/locationSets/${uid}`).json();
}
