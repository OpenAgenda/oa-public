function getCurrentAndUpcoming(agenda) {
  return (agenda.summary?.publishedEvents?.upcoming || 0) + (agenda.summary?.publishedEvents?.current || 0);
}

function getPassed(agenda) {
  return (agenda.summary?.publishedEvents?.passed || 0);
}

export default {
  getCurrentAndUpcoming,
  getPassed
};
