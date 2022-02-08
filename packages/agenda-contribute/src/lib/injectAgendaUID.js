export default function injectAgendaUID(res, apiRoot, agendaUID) {
  return Object.keys(res).reduce((injected, key) => ({
    ...injected,
    [key]: apiRoot + res[key].replace(':agendaUid', agendaUID)
  }), {});
}
