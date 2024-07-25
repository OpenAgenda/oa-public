export default (event, agendaEvent) => {
  if (event?.agendaUid === agendaEvent?.agendaUid) {
    return 'contribution';
  }
  if (agendaEvent?.aggregated) {
    return 'aggregation';
  }
  return 'share';
};
