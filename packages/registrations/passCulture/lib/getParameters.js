export default async function getParameters({ pc, siren }) {
  return Promise.all([
    pc.offers.events.categories.list(),
  ].concat(
    [].concat(siren).map(sirenItem => pc.offers.offererVenues({ siren: sirenItem })),
  )).then(([{
    categories,
    related,
  }, ...offererVenuesPerSiren]) => ({
    categories,
    related,
    offererVenues: offererVenuesPerSiren.reduce((carry, item) => carry.concat(item), []),
  }));
}
