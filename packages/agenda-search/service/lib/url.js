function contribute(agendaArg, options = {}) {
  const params = {
    path: undefined,
    lang: undefined,
    ...options,
  };

  const prefix = params.path === undefined ? '' : params.path;

  return `${prefix}/agendas/${agendaArg.uid}/contribute${params.lang ? `?lang=${params.lang}` : ''}`;
}

function network(networkArg, options) {
  const params = {
    paths: undefined,
    lang: undefined,
    ...options,
  };

  const prefix = params.path === undefined ? '' : params.path;

  return `${prefix}?network=${networkArg.uid}`;
}

function agenda(agendaArg, options = {}) {
  const params = {
    path: undefined,
    lang: undefined,
    ...options,
  };

  const prefix = params.path === undefined ? '' : params.path;

  if (!agendaArg) {
    return `${prefix}#${params.lang ? `?lang=${params.lang}` : ''}`;
  }

  if (agendaArg.slug) {
    return `${prefix}/${agendaArg.slug}${params.lang ? `?lang=${params.lang}` : ''}`;
  }

  if (agendaArg.uid) {
    return `${prefix}/agendas/${agendaArg.uid}${params.lang ? `?lang=${params.lang}` : ''}`;
  }

  return '#';
}

export default {
  agenda,
  network,
  contribute,
};
