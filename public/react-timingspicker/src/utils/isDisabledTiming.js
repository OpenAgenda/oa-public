import * as dateFns from 'date-fns';

export default (timing, disabled, enabled) => {
  const inEnabled = enabled && enabled.length
    ? enabled.some(enabledTiming => {
      const start = typeof enabledTiming.begin === 'string'
        ? dateFns.parseISO(enabledTiming.begin)
        : enabledTiming.begin;
      const end = typeof enabledTiming.end === 'string'
        ? dateFns.parseISO(enabledTiming.end)
        : enabledTiming.end;

      return (
        dateFns.isWithinInterval(timing.begin, { start, end })
            && dateFns.isWithinInterval(timing.end, { start, end })
      );
    })
    : true;

  const isDisabled = disabled
    && disabled.length
    && disabled.some(disabledTiming => {
      const start = typeof disabledTiming.begin === 'string'
        ? dateFns.parseISO(disabledTiming.begin)
        : disabledTiming.begin;
      const end = typeof disabledTiming.end === 'string'
        ? dateFns.parseISO(disabledTiming.end)
        : disabledTiming.end;

      return (
        (!dateFns.isBefore(timing.begin, start)
          && dateFns.isBefore(timing.begin, end))
        || (dateFns.isAfter(timing.end, start)
          && !dateFns.isAfter(timing.end, end))
        || (dateFns.isBefore(timing.begin, start)
          && dateFns.isAfter(timing.end, end))
      );
    });

  return !inEnabled || isDisabled;
};
