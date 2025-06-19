export default function isUpcomingOnlyQuery(query) {
  return (
    !query.timings
    && query.passed !== '1'
    && (!query.relative || query.relative?.includes('upcoming'))
    && !query.relative?.includes('passed')
  );
}
