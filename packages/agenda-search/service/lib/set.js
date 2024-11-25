import formatAgenda from './formatAgenda.js';

export default async ({ getDetailedAgenda, client, alias }, agenda) => {
  const body = await getDetailedAgenda(agenda).then((a) => formatAgenda(a));
  return client.index({
    index: alias,
    id: agenda.uid,
    body,
  });
};
