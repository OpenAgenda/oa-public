import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useSWRMutation from 'swr/mutation';
import { formatInTimeZone } from 'date-fns-tz';
import ky from 'ky';
import { useTimeoutFn } from 'react-use';
import {
  chakra,
  createListCollection,
  VStack,
  HStack,
  Text,
  Link,
  Textarea,
  Button,
  Stack,
} from '@openagenda/uikit';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  RadioGroup,
  Radio,
  Tooltip,
} from '@openagenda/uikit/snippets';
import extractEmails from '@openagenda/mails/extractEmails';
import { FaIcon } from 'icons';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import { faFacebookF, faXTwitter, faLinkedinIn } from 'icons/brands';
import copyText from 'utils/copyText';
import useEvent from '../../hooks/useEvent';
import { useAgenda } from '../../contexts/agenda';
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
      // eslint-disable-next-line prefer-template
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
      // eslint-disable-next-line prefer-template
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
      // eslint-disable-next-line prefer-template
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

async function sendEmails(
  url,
  { arg }: { arg: { email: string }[] },
): Promise<{ count: number }> {
  return ky
    .post(url, {
      json: {
        mailsend: arg.map(({ email }) => email).join(';'),
      },
    })
    .json();
}

export default function OtherShares({
  dialogRef,
  contentLocale,
  onClose,
  onEmailSent,
}) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();

  const agenda = useAgenda();
  const { event } = useEvent();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  absUrl.searchParams.delete('sharemodal');
  const eventUrl = new URL(absUrl);
  eventUrl.searchParams.set('cl', contentLocale);

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
          value: index,
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

  const [emailValue, setEmailValue] = useState('');
  const handleEmailsChange = (e) => {
    setEmailValue(e.target.value);
  };

  const emails = useMemo(() => extractEmails(emailValue), [emailValue]);

  const { trigger, isMutating } = useSWRMutation(
    `/${agenda.slug}/events/${event.uid}/email`,
    sendEmails,
    {
      onSuccess(data) {
        onClose();
        onEmailSent(data.count);
      },
    },
  );

  const [copied, setCopied] = useState(false);

  useTimeoutFn(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  return (
    <VStack align="stretch" gap="6">
      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          {intl.formatMessage(messages.shareOnSocialNetworks)}
        </Text>
        <HStack>
          <Button asChild variant="outline">
            <Link
              unstyled
              href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl.toString())}`}
              target="_blank"
              rel="noopener nofollow"
            >
              <FaIcon icon={faFacebookF} />
              Facebook
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              unstyled
              href={`https://twitter.com/share?url=${encodeURIComponent(eventUrl.toString())}`}
              target="_blank"
              rel="noopener nofollow"
            >
              <FaIcon icon={faXTwitter} />
              Twitter
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              unstyled
              href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl.toString())}&title=${encodeURIComponent(event.title[contentLocale])}&summary=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}&source=${eventUrl}`}
              target="_blank"
              rel="noopener nofollow"
            >
              <FaIcon icon={faLinkedinIn} />
              LinkedIn
            </Link>
          </Button>
        </HStack>
      </div>

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          {intl.formatMessage(messages.shareByEmail)}
        </Text>
        <Textarea
          placeholder={intl.formatMessage(messages.shareByEmailPlaceholder)}
          value={emailValue}
          onChange={handleEmailsChange}
        />
        <Text fontSize="sm" mb="2">
          {intl.formatMessage(messages.byEmailSub)}
        </Text>
        <Button
          type="submit"
          disabled={!emails.length}
          loading={isMutating}
          onClick={() => trigger(emails)}
        >
          {intl.formatMessage(messages.send)}
        </Button>
      </div>

      {currentAndUpcomingTimings.length ? (
        <div>
          <Text fontSize="lg" fontWeight="bold" mb="2">
            {intl.formatMessage(messages.shareCalendar)}
          </Text>

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

          <Button
            asChild
            disabled={service === '' || selectedTimingIndex === ''}
          >
            <Link
              unstyled
              href={importUrl}
              target="_blank"
              rel="noopener nofollow"
            >
              {intl.formatMessage(messages.import)}
            </Link>
          </Button>
        </div>
      ) : null}

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          {intl.formatMessage(messages.shareLink)}
        </Text>
        <chakra.div
          py="1"
          ps="4"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {absUrl.toString()}
          <Tooltip
            content={intl.formatMessage(messages.copied)}
            showArrow
            open={copied}
            openDelay={0}
            closeDelay={0}
          >
            <Button
              variant="outline"
              size="sm"
              mx="1"
              onClick={async () => {
                const success = await copyText(absUrl.toString());
                if (success) setCopied(true);
              }}
            >
              {intl.formatMessage(messages.copy)}
            </Button>
          </Tooltip>
        </chakra.div>
      </div>
    </VStack>
  );
}
