import ky from 'ky';
import qs from 'qs';

const dev = process.env.NODE_ENV === 'development';

export default async function loadEventData(agendaUid, publicKey, pageNumber) {
  const includeFields = [
    'title',
    'image',
    'slug',
    'description',
    'dateRange',
    'location',
    'registration',
    'accessibility',
    'onlineAccessLink',
  ];

  return ky
    .get(
      `https://${
        dev ? 'd' : ''
      }api.openagenda.com/v2/agendas/${agendaUid}/events?${qs.stringify({
        includeFields,
        key: publicKey,
        after: pageNumber?.map(String),
      })}`,
    )
    .json();
}
