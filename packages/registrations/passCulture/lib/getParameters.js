export default async function getParameters({ pc, siren }) {
  return Promise.all([
    pc.offers.events.categories.list(),
    pc.offers.offererVenues({ siren })
   ]).then(([{
    categories,
    related
   }, offererVenues]) => ({
    categories,
    related,
    offererVenues,
   }));
};
