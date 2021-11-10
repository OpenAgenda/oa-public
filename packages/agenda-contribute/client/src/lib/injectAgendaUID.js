export default function injectAgendaUID(res, APIRoot, agendaUID) {
  return Object.keys(res).reduce((injected, key) => ({
    ...injected,
    [key]: APIRoot + res[key].replace(':agendaUid', agendaUID)
  }), {});
}
