import { useMemo, useState } from 'react';
import { isFuture, compareAsc, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import capitalize from 'lodash/capitalize';
import { Flex, Box, Grid, IconButton } from '@openagenda/uikit';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import spreadTimings, { SpreadTimings } from 'utils/spreadTimings';
import { FaIcon } from 'icons';
import { faChevronLeft, faChevronRight } from 'icons/regular';

function findNextOrLastTiming(timingsPerMonth: SpreadTimings) {
  let lastTiming = null;

  const sortedMonths = Object.entries(timingsPerMonth).sort((a, b) => compareAsc(parseISO(a[0]), parseISO(b[0])));

  for (const [month, weeks] of sortedMonths) {
    const sortedWeeks = Object.entries(weeks).sort((a, b) => Number(a[0]) - Number(b[0]));
    for (const [week, days] of sortedWeeks) {
      const sortedDays = Object.entries(days).sort((a, b) => compareAsc(parseISO(a[0]), parseISO(b[0])));
      for (const [day, timings] of sortedDays) {
        for (const timing of timings) {
          lastTiming = { month, week, day, timing };
          if (isFuture(new Date(timing.begin))) {
            return lastTiming;
          }
        }
      }
    }
  }

  return lastTiming;
}

function findPreviousMonth(timingsPerMonth: SpreadTimings, month: string) {
  const sortedMonths = Object.keys(timingsPerMonth).sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
  const currentIndex = sortedMonths.indexOf(month);

  if (currentIndex <= 0) {
    return null;
  }

  return sortedMonths[currentIndex - 1];
}

function findNextMonth(timingsPerMonth: SpreadTimings, month: string) {
  const sortedMonths = Object.keys(timingsPerMonth).sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
  const currentIndex = sortedMonths.indexOf(month);

  if (currentIndex === -1 || currentIndex >= sortedMonths.length - 1) {
    return null;
  }

  return sortedMonths[currentIndex + 1];
}

export default function Timings({ timings, timezone }) {
  const dateFnsLocale = useDateFnsLocale();

  const timingsPerMonth = useMemo(() => spreadTimings(timings, timezone), [timings, timezone]);
  const nextOrLastTiming = useMemo(() => findNextOrLastTiming(timingsPerMonth), [timingsPerMonth]);

  const [currentMonth, setCurrentMonth] = useState(() => nextOrLastTiming.month);

  const previousMonth = useMemo(
    () => findPreviousMonth(timingsPerMonth, currentMonth),
    [currentMonth, timingsPerMonth],
  );
  const nextMonth = useMemo(
    () => findNextMonth(timingsPerMonth, currentMonth),
    [currentMonth, timingsPerMonth],
  );

  return (
    <>
      <Grid
        templateColumns="1fr auto 1fr"
        alignItems="center"
        h="12"
        borderY="1px solid"
        borderColor="oaGray.300"
      >
        {previousMonth ? (
          <IconButton
            aria-label="Previous month"
            size="lg"
            variant="ghost"
            icon={<FaIcon icon={faChevronLeft} />}
            _hover={{
              color: 'primary.500',
            }}
            justifySelf="start"
            onClick={() => setCurrentMonth(previousMonth)}
          />
        ) : null}
        <Box gridColumn="2" fontWeight="bold">
          {capitalize(formatInTimeZone(new Date(currentMonth), timezone, 'MMMM yyyy', { locale: dateFnsLocale }))}
        </Box>
        {nextMonth ? (
          <IconButton
            aria-label="Next month"
            size="lg"
            variant="ghost"
            icon={<FaIcon icon={faChevronRight} />}
            _hover={{
              color: 'primary.500',
            }}
            justifySelf="end"
            onClick={() => setCurrentMonth(nextMonth)}
          />
        ) : null}
      </Grid>

      <Flex direction="column" gap="2" mt="4">
        {Object.values(timingsPerMonth[currentMonth]).map(week =>
          Object.entries(week).map(([day, dayTimings]) => (
            <Flex key={day} justify="space-between">
              <div>{capitalize(formatInTimeZone(new Date(day), timezone, 'eeee d', { locale: dateFnsLocale }))}</div>
              <div>
                {dayTimings.map(timing => (
                  <div key={timing.begin}>
                    {formatInTimeZone(new Date(timing.begin), timezone, 'HH:mm', { locale: dateFnsLocale })}
                    &nbsp;-&nbsp;
                    {formatInTimeZone(new Date(timing.end), timezone, 'HH:mm', { locale: dateFnsLocale })}
                  </div>
                ))}
              </div>
            </Flex>
          )))}
      </Flex>
    </>
  );
}
