export default function Stopwatch() {
  const times = {};
  let now = new Date();

  function stopwatch(label, subTimes) {
    const ms = new Date().getTime() - now.getTime();
    now = new Date();

    times[label] = ms;

    if (subTimes) {
      for (const [key, value] of Object.entries(subTimes)) {
        times[`${label}.${key}`] = value;
      }
    }
  }

  stopwatch.getTimes = () => times;

  return stopwatch;
}
