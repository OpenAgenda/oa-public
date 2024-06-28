import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useSWRMutation from 'swr/mutation';
import { formatInTimeZone } from 'date-fns-tz';
import ky from 'ky';
import {
  chakra,
  VStack,
  HStack,
  Text,
  Link,
  Textarea,
  Button,
  Select,
  RadioGroup,
  Radio,
  Stack,
  useTimeout,
  Tooltip,
} from '@openagenda/uikit';
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
  // eslint-disable-next-line prefer-template
  return date.getUTCFullYear()
    + padTo2Digits(date.getUTCMonth() + 1)
    + padTo2Digits(date.getUTCDate())
    + 'T'
    + padTo2Digits(date.getUTCHours())
    + padTo2Digits(date.getUTCMinutes())
    + padTo2Digits(date.getUTCSeconds())
    + 'Z';
}

function getImportUrl({ service, agenda, event, eventUrl, timingIndex, contentLocale }) {
  if (timingIndex === '') {
    return null;
  }

  const timing = event.timings[timingIndex];
  const begin = new Date(timing.begin);
  const end = new Date(timing.end);

  const location = encodeURIComponent(`${event.location.name} - ${event.location.address}`);

  switch (service) {
    case 'google':
      // eslint-disable-next-line prefer-template
      return 'https://www.google.com/calendar/render?action=TEMPLATE'
        + `&text=${encodeURIComponent(event.title[contentLocale])}`
        + `&dates=${formatDateToGoogleCalendar(begin)}/${formatDateToGoogleCalendar(end)}`
        + `&ctz=${event.timezone}`
        + `&details=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}`
        + (event.location ? `&location=${location}` : '')
        + `&sprop=website:${encodeURIComponent(eventUrl)}`;
    case 'yahoo':
      // eslint-disable-next-line prefer-template
      return 'https://calendar.yahoo.com/?v=60'
        + `&TITLE=${encodeURIComponent(event.title[contentLocale])}`
        + `&ST=${formatInTimeZone(begin, event.timezone, 'yyyyMMdd\'T\'HHmmss')}`
        + `&ET=${formatInTimeZone(end, event.timezone, 'yyyyMMdd\'T\'HHmmss')}`
        + `&DESC=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}`
        + (event.location ? `&in_loc=${location}` : '');
    case 'live':
      // eslint-disable-next-line prefer-template
      return 'https://outlook.live.com/calendar/deeplink/compose?path=/calendar/action/compose'
        + '&rru=addevent'
        + `&startdt=${formatInTimeZone(begin, event.timezone, 'yyyy-MM-dd\'T\'HH:mm:ss')}`
        + `&enddt=${formatInTimeZone(end, event.timezone, 'yyyy-MM-dd\'T\'HH:mm:ss')}`
        + `&subject=${encodeURIComponent(event.title[contentLocale])}`
        + `&body=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}`
        + (event.location ? `&location=${location}` : '');
    case 'ics':
      return `/${agenda.slug}/events/${event.slug}/ics?timing=${timingIndex}&dl=1`;
    default:
      return null;
  }
}

async function sendEmails(url, { arg }: { arg: string[] }): Promise<{ count: number }> {
  return ky.post(url, {
    json: {
      mailsend: arg.join(';'),
    },
  }).json();
}

export default function OtherShares({ contentLocale, onClose, onEmailSent }) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();

  const agenda = useAgenda();
  const { event } = useEvent();

  const eventUrl = `${process.env.NEXT_PUBLIC_ROOT}${router.asPath}?cl=${contentLocale}`;

  const now = new Date();

  const currentAndUpcomingTimings = event.timings.filter(timing => new Date(timing.begin) > now);

  const [selectedTimingIndex, setSelectedTimingIndex] = useState(() => (currentAndUpcomingTimings.length === 1 ? '0' : ''));
  const [service, setService] = useState('');

  const onSelectTiming = e => setSelectedTimingIndex(e.target.value);

  const importUrl = getImportUrl({
    service,
    agenda,
    event,
    eventUrl,
    timingIndex: selectedTimingIndex,
    contentLocale,
  });

  const [emailValue, setEmailValue] = useState('');
  const handleEmailsChange = e => {
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

  useTimeout(() => {
    setCopied(false);
  }, copied ? 1000 : null);

  return (
    <VStack align="stretch" spacing="6">
      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          {intl.formatMessage(messages.shareOnSocialNetworks)}
        </Text>
        <HStack>
          <Button
            as={Link}
            variant="outline"
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl)}`}
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faFacebookF} />}
          >
            Facebook
          </Button>
          <Button
            as={Link}
            variant="outline"
            href={`https://twitter.com/share?url=${encodeURIComponent(eventUrl)}`}
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faXTwitter} />}
          >
            Twitter
          </Button>
          <Button
            as={Link}
            variant="outline"
            href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(event.title[contentLocale])}&summary=${encodeURIComponent(`${event.description[contentLocale]} - ${eventUrl}`)}&source=${eventUrl}`}
            isExternal
            colorScheme="primary"
            leftIcon={<FaIcon icon={faLinkedinIn} />}
          >
            LinkedIn
          </Button>
        </HStack>
      </div>

      <div>
        <Text fontSize="lg" fontWeight="bold" mb="2">
          {intl.formatMessage(messages.shareByEmail)}
        </Text>
        <Textarea
          mb="2"
          placeholder={intl.formatMessage(messages.shareByEmailPlaceholder)}
          value={emailValue}
          onChange={handleEmailsChange}
        />
        <Button
          type="submit"
          colorScheme="primary"
          isDisabled={!emails.length}
          isLoading={isMutating}
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

          <Select
            placeholder={intl.formatMessage(messages.selectTiming)}
            mb="2"
            onChange={onSelectTiming}
            value={selectedTimingIndex}
          >
            {currentAndUpcomingTimings.map((timing, index) => {
              if (new Date(timing.begin) < now) return null;
              return (
                <option key={timing.begin} value={index}>
                  {formatInTimeZone(timing.begin, event.timezone, 'PPPP, HH:mm', { locale: dateFnsLocale })}
                  &nbsp;-&nbsp;
                  {formatInTimeZone(timing.end, event.timezone, 'HH:mm', { locale: dateFnsLocale })}
                </option>
              );
            })}
          </Select>

          <RadioGroup onChange={setService} value={service} mb="2">
            <Stack>
              <Radio value="google">
                Google Calendar
              </Radio>
              <Radio value="yahoo">
                Yahoo! Calendar
              </Radio>
              <Radio value="live">
                Windows Live
              </Radio>
              <Radio value="ics">
                ICS
              </Radio>
            </Stack>
          </RadioGroup>

          <Button
            type="submit"
            as={Link}
            href={importUrl}
            isExternal
            colorScheme="primary"
            isDisabled={service === '' || selectedTimingIndex === ''}
          >
            {intl.formatMessage(messages.import)}
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
          border="1px"
          borderColor="gray.300"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {process.env.NEXT_PUBLIC_ROOT + router.asPath}
          <Tooltip
            label={intl.formatMessage(messages.copied)}
            hasArrow
            placement="auto"
            isOpen={copied}
            arrowSize={8}
            arrowPadding={6}
          >
            <Button
              colorScheme="primary"
              variant="outline"
              size="sm"
              mx="1"
              onClick={async () => {
                const success = await copyText(process.env.NEXT_PUBLIC_ROOT + router.asPath);
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
