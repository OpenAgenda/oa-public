import ky from 'ky';
import qs from 'qs';

const dev = process.env.NODE_ENV === 'development';

export default async function loadAgendaData(agendaUid, publicKey) {
  return ky
    .get(
      `https://${
        dev ? 'd' : ''
      }api.openagenda.com/v2/agendas/${agendaUid}?${qs.stringify({
        key: publicKey,
      })}`,
    )
    .json();
}
