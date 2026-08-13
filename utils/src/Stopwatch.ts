export type Times = Record<string, number>;

export interface StopwatchFn {
  (label: string, subTimes?: Times): void;
  getTimes: () => Times;
}

export default function Stopwatch(): StopwatchFn {
  const times: Times = {};
  let now = new Date();

  const stopwatch = ((label: string, subTimes?: Times) => {
    const ms = new Date().getTime() - now.getTime();
    now = new Date();

    times[label] = ms;

    if (subTimes) {
      for (const [key, value] of Object.entries(subTimes)) {
        times[`${label}.${key}`] = value;
      }
    }
  }) as StopwatchFn;

  stopwatch.getTimes = () => times;

  return stopwatch;
}
