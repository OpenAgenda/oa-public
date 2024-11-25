export default (query, nav) => {
  if (nav?.sort || query?.search) return nav.after;

  const [recentlyAddedEvents, ...rest] = nav.after;

  return [!!parseInt(recentlyAddedEvents, 10)].concat(rest);
};
