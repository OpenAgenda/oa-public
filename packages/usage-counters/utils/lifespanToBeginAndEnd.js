export default function lifespanToBeginAndEnd(lifespan, options = {}) {
  const { now = Date.now() } = options;
  const begin = now - (now % lifespan);
  const end = begin + lifespan;
  return { begin: new Date(begin), end: new Date(end) };
}
