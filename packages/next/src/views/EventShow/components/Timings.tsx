import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { isFuture, compareAsc, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import capitalize from 'lodash/capitalize';
import { Flex, Box, Grid, IconButton } from '@openagenda/uikit';
import { spreadTimings, SpreadTimings } from '@openagenda/date-utils';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import { FaIcon } from 'icons';
import { faChevronLeft, faChevronRight } from 'icons/regular';
import { timings as messages } from '../messages';

function findNextOrLastTiming(timingsPerMonth: SpreadTimings) {
  let lastTiming = null;

  const sortedMonths = Object.entries(timingsPerMonth).sort((a, b) =>
    compareAsc(parseISO(a[0]), parseISO(b[0])),
  );

  for (const [month, weeks] of sortedMonths) {
    const sortedWeeks = Object.entries(weeks).sort(
      (a, b) => Number(a[0]) - Number(b[0]),
    );
    for (const [week, days] of sortedWeeks) {
      const sortedDays = Object.entries(days).sort((a, b) =>
        compareAsc(parseISO(a[0]), parseISO(b[0])),
      );
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
  const sortedMonths = Object.keys(timingsPerMonth).sort((a, b) =>
    compareAsc(parseISO(a), parseISO(b)),
  );
  const currentIndex = sortedMonths.indexOf(month);

  if (currentIndex <= 0) {
    return null;
  }

  return sortedMonths[currentIndex - 1];
}

function findNextMonth(timingsPerMonth: SpreadTimings, month: string) {
  const sortedMonths = Object.keys(timingsPerMonth).sort((a, b) =>
    compareAsc(parseISO(a), parseISO(b)),
  );
  const currentIndex = sortedMonths.indexOf(month);

  if (currentIndex === -1 || currentIndex >= sortedMonths.length - 1) {
    return null;
  }

  return sortedMonths[currentIndex + 1];
}

function TimingsDisplay({ timingsPerWeek, timezone }) {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <Flex direction="column" gap="2">
      {Object.values(timingsPerWeek).map((week) =>
        Object.entries(week).map(([day, dayTimings]) => (
          <Flex key={day} justify="space-between">
            <div>
              {capitalize(
                formatInTimeZone(new Date(day), 'UTC', 'eeee d', {
                  locale: dateFnsLocale,
                }),
              )}
            </div>
            <div>
              {dayTimings.map((timing) => (
                <div key={timing.begin}>
                  {formatInTimeZone(new Date(timing.begin), timezone, 'HH:mm', {
                    locale: dateFnsLocale,
                  })}
                  &nbsp;-&nbsp;
                  {formatInTimeZone(new Date(timing.end), timezone, 'HH:mm', {
                    locale: dateFnsLocale,
                  })}
                </div>
              ))}
            </div>
          </Flex>
        )),
      )}
    </Flex>
  );
}

function TimingsWithNavigation({ timings, timezone }) {
  const intl = useIntl();
  const dateFnsLocale = useDateFnsLocale();

  const timingsPerMonth = useMemo(
    () => spreadTimings(timings, timezone),
    [timings, timezone],
  );
  const nextOrLastTiming = useMemo(
    () => findNextOrLastTiming(timingsPerMonth),
    [timingsPerMonth],
  );

  const [currentMonth, setCurrentMonth] = useState(
    () => nextOrLastTiming.month,
  );

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
        mb="4"
      >
        {previousMonth ? (
          <IconButton
            aria-label={intl.formatMessage(messages.previousMonth)}
            size="lg"
            variant="ghost"
            _hover={{
              color: 'primary.500',
            }}
            justifySelf="start"
            onClick={() => setCurrentMonth(previousMonth)}
          >
            <FaIcon icon={faChevronLeft} />
          </IconButton>
        ) : null}
        <Box gridColumn="2" fontWeight="bold">
          {capitalize(
            formatInTimeZone(new Date(currentMonth), 'UTC', 'MMMM yyyy', {
              locale: dateFnsLocale,
            }),
          )}
        </Box>
        {nextMonth ? (
          <IconButton
            aria-label={intl.formatMessage(messages.nextMonth)}
            size="lg"
            variant="ghost"
            _hover={{
              color: 'primary.500',
            }}
            justifySelf="end"
            onClick={() => setCurrentMonth(nextMonth)}
          >
            <FaIcon icon={faChevronRight} />
          </IconButton>
        ) : null}
      </Grid>

      <TimingsDisplay
        timingsPerWeek={timingsPerMonth[currentMonth]}
        timezone={timezone}
      />
    </>
  );
}

function TimingsWithoutNavigation({ timings, timezone }) {
  const dateFnsLocale = useDateFnsLocale();

  const timingsPerMonth = useMemo(
    () => spreadTimings(timings, timezone),
    [timings, timezone],
  );

  return (
    <Flex direction="column" gap="4">
      {Object.entries(timingsPerMonth).map(([month, weeks]) => (
        <div key={month}>
          <Flex
            h="12"
            borderY="1px solid"
            borderColor="oaGray.300"
            fontWeight="bold"
            alignItems="center"
            justify="center"
            mb="4"
          >
            {capitalize(
              formatInTimeZone(new Date(month), 'UTC', 'MMMM yyyy', {
                locale: dateFnsLocale,
              }),
            )}
          </Flex>

          <TimingsDisplay timingsPerWeek={weeks} timezone={timezone} />
        </div>
      ))}
    </Flex>
  );
}

export default function Timings({ timings, timezone }) {
  if (timings.length <= 10) {
    return <TimingsWithoutNavigation timings={timings} timezone={timezone} />;
  }

  return <TimingsWithNavigation timings={timings} timezone={timezone} />;
}
