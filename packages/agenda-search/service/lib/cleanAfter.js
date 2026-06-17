export default (query, nav) => {
  // The leading `search_after` value matches the leading sort key. When that
  // key is `_recentlyAddedEvents` (a boolean), ES emits 0/1 in the hit sort but
  // rejects a numeric `search_after` on a boolean field — coerce it back. This
  // holds both for the explicit `recentlyAddedEvents.desc` sort and for the
  // implicit browse default (no `sort`, no `search`); every other sort
  // (`createdAt.desc`, `_score`) carries its raw values through untouched.
  const sortsByRecentlyAdded = nav?.sort === 'recentlyAddedEvents.desc' || (!nav?.sort && !query?.search);

  if (!sortsByRecentlyAdded) return nav.after;

  const [recentlyAddedEvents, ...rest] = nav.after;

  return [!!parseInt(recentlyAddedEvents, 10)].concat(rest);
};
