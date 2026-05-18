export default (root, agenda, event) =>
  `${root}/${agenda.slug}/events/${event.uid}_${event.slug}`;
