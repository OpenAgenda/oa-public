'use strict';

module.exports = event => {
  const { originAgenda, sourceAgendas = null } = event;

  if (!originAgenda) {
    return {
      oaUrl: '#'
    };
  }
  const copyOriginAgenda = { ...originAgenda };
  if (copyOriginAgenda.image) delete copyOriginAgenda.image;
  copyOriginAgenda.oaUrl = `https://openagenda.com/agendas/${event.originAgenda.uid}`;

  if (!sourceAgendas) return copyOriginAgenda;

  const agenda = sourceAgendas.find(sourceAgenda => sourceAgenda.uid === event.originAgenda.uid);

  if (!agenda) return copyOriginAgenda;

  const { slug, url } = agenda;
  return {
    ...copyOriginAgenda,
    url,
    slug
  };
};
