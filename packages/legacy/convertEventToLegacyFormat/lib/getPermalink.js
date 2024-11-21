export default ({ uid, root }, event) =>
  `${root}/agendas/${uid}/events/${event.uid}`;
