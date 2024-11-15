export default (options, { target, source }) => ({
  source,
  target,
  field: 'permalink',
  transform: (eventUid) =>
    `https://openagenda.com/agendas/${options.agendaUid}/events/${eventUid}`,
});
