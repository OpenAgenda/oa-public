import axios from 'axios';
import qs from 'qs';

const dev = process.env.NODE_ENV === 'development';

export default async function loadAgendaData(agendaUid, publicKey) {
  const { data } = await axios.get(
    `https://${
      dev ? 'd' : ''
    }api.openagenda.com/v2/agendas/${agendaUid}?${qs.stringify({
      key: publicKey,
    })}`,
  );

  return data;
}
