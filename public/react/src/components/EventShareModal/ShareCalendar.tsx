import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Stack, Button, Link, createListCollection } from '@openagenda/uikit';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  RadioGroup,
  Radio,
} from '@openagenda/uikit/snippets';
import { Agenda } from '../../types';
import AccordionItem from '../AccordionItem';
// import { Event } from '../../hooks/useEvent';
import messages from './messages';

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function formatDateToGoogleCalendar(date: Date) {
  return `${
    date.getUTCFullYear()
    + padTo2Digits(date.getUTCMonth() + 1)
    + padTo2Digits(date.getUTCDate())
  }T${padTo2Digits(date.getUTCHours())}${padTo2Digits(date.getUTCMinutes())}${padTo2Digits(date.getUTCSeconds())}Z`;
}

function formatDateForCalendar(
  date: Date,
  timezone: string,
  format: 'yahoo' | 'live',
): string {
  const zonedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const parts = zonedDate.reduce(
    (acc, part) => {
      acc[part.type] = part.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  if (format === 'yahoo') {
    // Format: yyyyMMddTHHmmss
    return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
  }

  // Format: yyyy-MM-ddTHH:mm:ss
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function isOnline(event) {
  return event.attendanceMode !== 1;
}

function getImportUrl({
  service,
  agenda,
  event,
  eventUrl,
  timingIndex,
  contentLocale,
  intl,
}) {
  if (timingIndex === '') {
    return null;
  }

  const timing = event.timings[timingIndex];
  const begin = new Date(timing.begin);
  const end = new Date(timing.end);

  const location = encodeURIComponent(
    isOnline(event)
      ? intl.formatMessage(messages.online)
      : `${event.location.name} - ${event.location.address}`,
  );

  switch (service) {
    case 'google':
      return (
        'https://www.google.com/calendar/render?action=TEMPLATE'
        + `&text=${encodeURIComponent(event.title[contentLocale])}`
        + `&dates=${formatDateToGoogleCalendar(begin)}/${formatDateToGoogleCalendar(end)}`
        + `&ctz=${event.timezone}`
        + `&details=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
          event.location ? `&location=${location}` : ''
        }&sprop=website:${encodeURIComponent(eventUrl)}`
      );
    case 'yahoo':
      return (
        'https://calendar.yahoo.com/?v=60'
        + `&TITLE=${encodeURIComponent(event.title[contentLocale])}`
        + `&ST=${formatDateForCalendar(begin, event.timezone, 'yahoo')}`
        + `&ET=${formatDateForCalendar(end, event.timezone, 'yahoo')}`
        + `&DESC=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
          event.location ? `&in_loc=${location}` : ''
        }`
      );
    case 'live':
      return (
        'https://outlook.live.com/calendar/deeplink/compose?path=/calendar/action/compose'
        + '&rru=addevent'
        + `&startdt=${formatDateForCalendar(begin, event.timezone, 'live')}`
        + `&enddt=${formatDateForCalendar(end, event.timezone, 'live')}`
        + `&subject=${encodeURIComponent(event.title[contentLocale])}`
        + `&body=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
          event.location ? `&location=${location}` : ''
        }`
      );
    case 'ics':
      return `/${agenda.slug}/events/${event.slug}/ics?timing=${timingIndex}&dl=1`;
    default:
      return null;
  }
}

type ShareCalendarProps = {
  dialogRef: React.RefObject<HTMLElement>;
  agenda: Agenda;
  event: any; // Event;
  eventUrl: URL | string;
  contentLocale: string;
};

export default function ShareCalendar({
  dialogRef,
  agenda,
  event,
  eventUrl,
  contentLocale,
}: ShareCalendarProps) {
  const intl = useIntl();
  const now = new Date();

  const currentAndUpcomingTimings = event.timings.filter(
    (timing) => new Date(timing.begin) > now,
  );

  const currentAndUpcomingTimingsCollection = useMemo(
    () =>
      createListCollection({
        items: currentAndUpcomingTimings.map((timing, index) => ({
          label: `${intl.formatDate(timing.begin, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: event.timezone,
          })} - ${intl.formatDate(timing.end, {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: event.timezone,
          })}`,
          value: String(index),
        })),
      }),
    [currentAndUpcomingTimings, intl, event.timezone],
  );

  const [selectedTimingIndex, setSelectedTimingIndex] = useState(() =>
    (currentAndUpcomingTimings.length === 1 ? '0' : ''));
  const [service, setService] = useState('');

  const hasUpcomingTimings = currentAndUpcomingTimings.length > 0;

  const importUrl = getImportUrl({
    intl,
    service,
    agenda,
    event,
    eventUrl,
    timingIndex: selectedTimingIndex,
    contentLocale,
  });

  return (
    <AccordionItem
      value="calendar"
      title={intl.formatMessage(messages.shareCalendar)}
      disabled={!hasUpcomingTimings}
      disabledTooltip={
        !hasUpcomingTimings
          ? intl.formatMessage(messages.noUpcomingTimings)
          : undefined
      }
    >
      <SelectRoot
        collection={currentAndUpcomingTimingsCollection}
        value={[selectedTimingIndex]}
        onValueChange={(e) => setSelectedTimingIndex(e.value[0])}
        mb="2"
      >
        <SelectTrigger>
          <SelectValueText
            placeholder={intl.formatMessage(messages.selectTiming)}
          />
        </SelectTrigger>
        <SelectContent portalRef={dialogRef}>
          {currentAndUpcomingTimingsCollection.items.map((timing: any) => (
            <SelectItem key={timing.value} item={timing}>
              {timing.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      <RadioGroup
        onValueChange={(e) => setService(e.value)}
        value={service}
        mb="2"
      >
        <Stack>
          <Radio value="google">Google Calendar</Radio>
          <Radio value="yahoo">Yahoo! Calendar</Radio>
          <Radio value="live">Windows Live</Radio>
          <Radio value="ics">ICS</Radio>
        </Stack>
      </RadioGroup>

      <Button asChild disabled={service === '' || selectedTimingIndex === ''}>
        <Link unstyled href={importUrl} target="_blank" rel="noopener nofollow">
          {intl.formatMessage(messages.import)}
        </Link>
      </Button>
    </AccordionItem>
  );
}
