import { useMemo, useState, useId } from 'react';
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

function DayTimings({ day, dayTimings, timezone }) {
  const dateFnsLocale = useDateFnsLocale();
  const dayId = useId();

  return (
    <Flex as="li" key={day} justify="space-between">
      <div id={dayId}>
        {capitalize(
          formatInTimeZone(new Date(day), 'UTC', 'eeee d', {
            locale: dateFnsLocale,
          }),
        )}
      </div>
      <Flex as="ul" direction="column" aria-labelledby={dayId}>
        {dayTimings.map((timing) => (
          <Box as="li" key={timing.begin}>
            <time dateTime={new Date(timing.begin).toISOString()}>
              {formatInTimeZone(new Date(timing.begin), timezone, 'HH:mm', {
                locale: dateFnsLocale,
              })}
            </time>
            &nbsp;-&nbsp;
            <time dateTime={new Date(timing.end).toISOString()}>
              {formatInTimeZone(new Date(timing.end), timezone, 'HH:mm', {
                locale: dateFnsLocale,
              })}
            </time>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}

function TimingsDisplay({ timingsPerWeek, timezone }) {
  return (
    <Flex as="ul" direction="column" gap="2">
      {Object.values(timingsPerWeek).map((week) =>
        Object.entries(week).map(([day, dayTimings]) => (
          <DayTimings
            key={day}
            day={day}
            dayTimings={dayTimings}
            timezone={timezone}
          />
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
    () => nextOrLastTiming?.month,
  );

  const previousMonth = useMemo(
    () => findPreviousMonth(timingsPerMonth, currentMonth),
    [currentMonth, timingsPerMonth],
  );
  const nextMonth = useMemo(
    () => findNextMonth(timingsPerMonth, currentMonth),
    [currentMonth, timingsPerMonth],
  );

  if (!currentMonth) {
    return null;
  }

  return (
    <>
      <Grid
        as="nav"
        aria-label={intl.formatMessage(messages.navigationByMonth)}
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
              color: 'oaBlue.500',
            }}
            justifySelf="start"
            onClick={() => setCurrentMonth(previousMonth)}
          >
            <FaIcon icon={faChevronLeft} />
          </IconButton>
        ) : (
          <Box />
        )}
        <Box
          as="h2"
          gridColumn="2"
          fontWeight="bold"
          aria-live="polite"
          aria-atomic="true"
        >
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
              color: 'oaBlue.500',
            }}
            justifySelf="end"
            onClick={() => setCurrentMonth(nextMonth)}
          >
            <FaIcon icon={faChevronRight} />
          </IconButton>
        ) : (
          <Box />
        )}
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
            as="h2"
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
  if (!timings || timings.length === 0) {
    return null;
  }

  if (timings.length <= 10) {
    return <TimingsWithoutNavigation timings={timings} timezone={timezone} />;
  }

  return <TimingsWithNavigation timings={timings} timezone={timezone} />;
}
