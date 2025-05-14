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
import { formatInTimeZone } from 'date-fns-tz';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import { Agenda } from 'types';
import AccordionItem from 'components/AccordionItem';
import { Event } from '../../hooks/useEvent';
import { shareModal as messages } from '../../messages';

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function formatDateToGoogleCalendar(date: Date) {
  return `${
    date.getUTCFullYear() +
    padTo2Digits(date.getUTCMonth() + 1) +
    padTo2Digits(date.getUTCDate())
  }T${padTo2Digits(date.getUTCHours())}${padTo2Digits(date.getUTCMinutes())}${padTo2Digits(date.getUTCSeconds())}Z`;
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
        'https://www.google.com/calendar/render?action=TEMPLATE' +
        `&text=${encodeURIComponent(event.title[contentLocale])}` +
        `&dates=${formatDateToGoogleCalendar(begin)}/${formatDateToGoogleCalendar(end)}` +
        `&ctz=${event.timezone}` +
        `&details=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
          event.location ? `&location=${location}` : ''
        }&sprop=website:${encodeURIComponent(eventUrl)}`
      );
    case 'yahoo':
      return (
        'https://calendar.yahoo.com/?v=60' +
        `&TITLE=${encodeURIComponent(event.title[contentLocale])}` +
        `&ST=${formatInTimeZone(begin, event.timezone, "yyyyMMdd'T'HHmmss")}` +
        `&ET=${formatInTimeZone(end, event.timezone, "yyyyMMdd'T'HHmmss")}` +
        `&DESC=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
          event.location ? `&in_loc=${location}` : ''
        }`
      );
    case 'live':
      return (
        'https://outlook.live.com/calendar/deeplink/compose?path=/calendar/action/compose' +
        '&rru=addevent' +
        `&startdt=${formatInTimeZone(begin, event.timezone, "yyyy-MM-dd'T'HH:mm:ss")}` +
        `&enddt=${formatInTimeZone(end, event.timezone, "yyyy-MM-dd'T'HH:mm:ss")}` +
        `&subject=${encodeURIComponent(event.title[contentLocale])}` +
        `&body=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}${
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
  event: Event;
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
  const dateFnsLocale = useDateFnsLocale();
  const now = new Date();

  const currentAndUpcomingTimings = event.timings.filter(
    (timing) => new Date(timing.begin) > now,
  );

  const currentAndUpcomingTimingsCollection = useMemo(
    () =>
      createListCollection({
        items: currentAndUpcomingTimings.map((timing, index) => ({
          label: `${formatInTimeZone(
            timing.begin,
            event.timezone,
            'PPPP, HH:mm',
            { locale: dateFnsLocale },
          )} - ${formatInTimeZone(timing.end, event.timezone, 'HH:mm', {
            locale: dateFnsLocale,
          })}`,
          value: String(index),
        })),
      }),
    [currentAndUpcomingTimings, dateFnsLocale, event.timezone],
  );

  const [selectedTimingIndex, setSelectedTimingIndex] = useState(() =>
    currentAndUpcomingTimings.length === 1 ? '0' : '',
  );
  const [service, setService] = useState('');

  const importUrl = getImportUrl({
    intl,
    service,
    agenda,
    event,
    eventUrl,
    timingIndex: selectedTimingIndex,
    contentLocale,
  });

  return currentAndUpcomingTimings.length ? (
    <AccordionItem
      value="calendar"
      title={intl.formatMessage(messages.shareCalendar)}
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
          {currentAndUpcomingTimingsCollection.items.map((timing) => (
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
  ) : null;
}
