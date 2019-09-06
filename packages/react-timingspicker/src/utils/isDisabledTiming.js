import dateFns from 'date-fns';

export default ({ begin, end }, disabled, enabled) => {
  const inEnabled = enabled && enabled.length
    ? enabled.some(
      enabledTiming => dateFns.isWithinRange(
        begin,
        enabledTiming.begin,
        enabledTiming.end
      )
            && dateFns.isWithinRange(end, enabledTiming.begin, enabledTiming.end)
    )
    : true;

  const isDisabled = disabled
    && disabled.length
    && disabled.some(
      disabledTiming => (!dateFns.isBefore(begin, disabledTiming.begin)
          && dateFns.isBefore(begin, disabledTiming.end))
        || (dateFns.isAfter(end, disabledTiming.begin)
          && !dateFns.isAfter(end, disabledTiming.end))
        || (dateFns.isBefore(begin, disabledTiming.begin)
          && dateFns.isAfter(end, disabledTiming.end))
    );

  return !inEnabled || isDisabled;
};
