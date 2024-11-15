export default (event) => {
  if (!event.timings || !event.timings.length) {
    return undefined;
  }

  const lastEndTime = event.timings.reduce(
    (last, timing) => (timing.end > last ? timing.end : last),
    event.timings[0].end,
  );

  return Math.floor(
    (new Date(lastEndTime).getTime() - new Date().getTime())
      / 1000
      / 60
      / 60
      / 24,
  );
};
