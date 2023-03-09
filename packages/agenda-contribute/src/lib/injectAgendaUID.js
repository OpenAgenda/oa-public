export default function injectAgendaUIDAndSlug(res, apiRoot, agenda) {
  return Object.keys(res).reduce((injected, key) => ({
    ...injected,
    [key]: apiRoot + res[key].replace(':agendaUid', agenda.uid).replace(':agendaSlug', agenda.slug),
  }), {});
}
