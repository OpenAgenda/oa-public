'use client';

import { useLayoutEffect, useMemo } from 'react';
import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  chakra,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  List,
  Wrap,
  WrapItem,
} from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import { getFilters, useFilters } from '@openagenda/react-filters';
import { nl2br } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import qs from 'qs';
import useSessionStorageState from 'use-session-storage-state';
import useClientAnalytics from '@/src/hooks/useClientAnalytics';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';
import useAppLocationQuery from '@/src/utils/useAppLocationQuery';
import Image from '@/src/components/Image';
import ConsentBanner from '@/src/components/ConsentBanner';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import { FaIcon } from '@/src/icons';
import {
  faShareNodes,
  faGlobe,
  faPhone,
  faLink,
  faClock,
  faClockRotateLeft,
  faSquareCheck,
  faTicket,
} from '@/src/icons/thin';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import getContentLocale from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_utils/getContentLocale';
import {
  ConditionsSection,
  DateRangeSection,
  OnlineAccessSection,
  RegistrationSection,
} from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/Sidebar';
import StatusTag from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/StatusTag';
import EventImage from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/EventImage';
import AdditionalFields from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/AdditionalFields';
import * as additionalFieldsUtils from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_utils/additionalFields';
import LongDescription from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/LongDescription';
import messages from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/messages';
import Map from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/Map';
import Timings from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/Timings';
import useNcEffect from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_hooks/useNcEffect';
import { faThumbtack } from '@/src/icons/solid';
import { thumborLoader } from '@/src/utils/imageLoader';
import { embedAgendaUrlRegex } from '@/src/utils/isNextUrl';
import { FALLBACK_LOCALE } from '@/src/config/constants';
import OAAttribution from '@/src/components/OAAttribution';
import useEvent from '../_hooks/useEvent';
import Sidebar, { ShareSection, getRegistrationIcon } from './Sidebar';
import NavigateButton from './NavigateButton';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

export type EmbedEventShowProps = {
  referrer?: string;
};

export default function EmbedEventShow({
  referrer: referrerProps,
}: EmbedEventShowProps) {
  const intl = useIntl();
  const dateFnsLocale = useDateFnsLocale();

  const {
    initPath,
    baseUrl,
    prefilter,
    logo,
    referrer: layoutDataReferrer,
    setReferrer,
  } = useEmbedLayoutData();

  const referrer = layoutDataReferrer || referrerProps;

  const agenda = useAgenda();
  const { event } = useEvent({ referrer });

  const query = useAppLocationQuery() as any;

  const isViewedInAgendaContext = useMemo(
    () => embedAgendaUrlRegex.test(initPath),
    [initPath],
  );

  const needConsentFor = useClientAnalytics(
    agenda.settings?.tracking,
    'localStorage',
  );

  const languages = Object.keys(event.title);

  const searchParams = useSearchParams();
  const contentLocale = getContentLocale(
    languages,
    searchParams.get('cl') || prefilter.cl,
    intl.locale,
  );

  const hasAdditionalFields = useMemo(
    () => additionalFieldsUtils.hasAdditionalFields(agenda.schema),
    [agenda.schema],
  );

  const additionalFields = useMemo(
    () =>
      additionalFieldsUtils.formatAdditionalFieldData({
        schema: agenda.schema,
        event,
        locale: contentLocale,
        defaultLocale: intl.locale,
        dateFnsLocale,
      }),
    [agenda.schema, dateFnsLocale, event, contentLocale, intl.locale],
  );

  const filtersToInclude = useMemo(() => {
    const requiredFilters = (prefilter.filters as string)?.split(',') ?? [];

    return getFilters(intl, agenda.schema.fields)
      .map(({ name, fieldSchema }) => fieldSchema?.field || name)
      .filter((filter) => requiredFilters.includes(filter))
      .sort((a, b) => {
        // Last
        if (a === 'geo') return 1;
        if (b === 'geo') return -1;
        // Second to last
        if (a === 'search') return 1;
        if (b === 'search') return -1;
        return requiredFilters.indexOf(a) - requiredFilters.indexOf(b);
      });
  }, [agenda.schema.fields, prefilter.filters]);

  const filters = useFilters(intl, agenda.schema.fields, {
    dateFnsLocale,
    missingValue: 'null',
    mapTiles:
      'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
    // exclude: adminFilters,
    include: filtersToInclude,
  });

  useNcEffect({ agendaUid: agenda.uid, eventUid: event.uid });

  useLayoutEffect(() => {
    if (layoutDataReferrer === undefined) {
      setReferrer(referrerProps || null);
    }
  }, []);

  const [nc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  return (
    <>
      <Grid
        templateAreas={{
          base: '"event"',
          lg: '"event sidebar"',
        }}
        templateColumns={{
          base: '1fr',
          lg: '2fr minmax(300px, 1fr)',
        }}
        columnGap="10"
        maxW="5xl"
        mx="auto"
      >
        <GridItem
          area="sidebar"
          display={{ base: 'none', lg: 'flex' }}
          gap="8"
          flexDirection="column"
          flexGrow="1"
        >
          <Sidebar
            key={event.uid}
            referrer={referrer}
            contentLocale={contentLocale}
          />
        </GridItem>

        <GridItem area="event" display="flex" flexDirection="column" gap="12">
          <div>
            {eventNc || isViewedInAgendaContext ? (
              <Flex justify="space-between" align="center" mb="4">
                <Link asChild>
                  <NextLink
                    href={`/embed/agendas/${agenda.uid}${qs.stringify(
                      {
                        ...eventNc,
                        initPath: `/embed/agendas/${agenda.uid}${qs.stringify(
                          {
                            ...prefilter,
                            baseUrl,
                          },
                          { addQueryPrefix: true },
                        )}`,
                        host: referrer || undefined,
                        from: undefined,
                        first: undefined,
                        last: undefined,
                      },
                      { addQueryPrefix: true },
                    )}`}
                  >
                    {intl.formatMessage(messages.backToList)}
                  </NextLink>
                </Link>
                {!(eventNc?.first && eventNc?.last) ? (
                  <Flex gap="2">
                    <NavigateButton
                      direction="previous"
                      prefilter={prefilter}
                      filters={filters}
                      referrer={referrer}
                    />
                    <NavigateButton
                      direction="next"
                      prefilter={prefilter}
                      filters={filters}
                      referrer={referrer}
                    />
                  </Flex>
                ) : null}
              </Flex>
            ) : null}

            <Flex
              as="main"
              display="flex"
              direction="column"
              gap="4"
              position="relative"
              // border="1px solid"
              // borderColor="oaGray.100"S
              // borderRadius="sm"
              // _hover={{
              //   borderColor: 'primary.500',
              // }}
            >
              {event.status !== 1 || event.featured ? (
                <Wrap>
                  {event.featured ? (
                    <WrapItem>
                      <Tag variant="solid">
                        <Icon mr="2" color="primaryContrast">
                          <FaIcon icon={faThumbtack} />
                        </Icon>
                        {intl.formatMessage(messages.featured)}
                      </Tag>
                    </WrapItem>
                  ) : null}
                  {event.status !== 1 ? (
                    <WrapItem>
                      <StatusTag status={event.status} />
                    </WrapItem>
                  ) : null}
                </Wrap>
              ) : null}

              {event.title?.[contentLocale] ? (
                <Heading as="h1" fontSize="4xl">
                  {event.title[contentLocale]}
                </Heading>
              ) : null}

              {event.description?.[contentLocale] ? (
                <Box fontSize="xl">{event.description[contentLocale]}</Box>
              ) : null}

              <ShareSection
                event={event}
                display={{ base: 'grid', lg: 'none' }}
                justifyItems="flex-start"
                icon={faShareNodes}
                contentLocale={contentLocale}
              />
              <OnlineAccessSection
                event={event}
                display={{ base: 'grid', lg: 'none' }}
                icon={faLink}
              />
              <DateRangeSection
                event={event}
                display={{ base: 'grid', lg: 'none' }}
                upcomingIcon={faClock}
                pastIcon={faClockRotateLeft}
              />
              <ConditionsSection
                event={event}
                display={{ base: 'grid', lg: 'none' }}
                icon={faTicket}
              />
              <RegistrationSection
                event={event}
                display={{ base: 'grid', lg: 'none' }}
                icon={faSquareCheck}
                getRegistrationIcon={getRegistrationIcon}
              />

              {event.image || event.imageCredits ? (
                <div>
                  <EventImage
                    event={event}
                    // >= 1038 : 659px
                    // >= 992 : 66.67vw
                    // < 992 : 100vw
                    sizes="(max-width: 992px) 100vw, (max-width: 1038px) 66.67vw, 659px"
                  />

                  {event.imageCredits ? (
                    <Flex justify="flex-end" color="oaGray.500" px="2">
                      {event.imageCredits}
                    </Flex>
                  ) : null}
                </div>
              ) : null}

              {event.longDescription?.[contentLocale] ? (
                <LongDescription
                  html={event.longDescription[contentLocale].replace(
                    /<a\s/g,
                    '<a target="_blank" rel="noopener nofollow" ',
                  )}
                  links={event.links}
                />
              ) : null}

              {/* event.longDescription?.[contentLocale] ? (
                <chakra.div sx={mdStyle}>
                  <ReactMarkdown
                    {...getReactMarkdownProps({
                      selfDomain: false,
                      embedLinks: event.links,
                    }) as ReactMarkdownOptions}
                  >
                    {event.longDescription[contentLocale]}
                  </ReactMarkdown>
                </chakra.div>
              ) : null */}

              {event.keywords?.[contentLocale]?.length ? (
                <chakra.div color="oaGray.500">
                  {intl.formatList(event.keywords[contentLocale], {
                    style: 'narrow',
                  })}
                </chakra.div>
              ) : null}
            </Flex>
          </div>

          {/* additional fields */}
          {hasAdditionalFields ? (
            <Flex direction="column" gap="4">
              <AdditionalFields
                agenda={agenda}
                additionalFields={additionalFields}
              />
            </Flex>
          ) : null}

          {/* timings */}
          <chakra.div display={{ base: 'block', lg: 'none' }}>
            <Timings
              key={event.uid}
              timings={event.timings}
              timezone={event.timezone}
            />
          </chakra.div>

          {/* location */}
          {event.location ? (
            <div>
              <Heading as="h2" fontSize="2xl" mb="4">
                {intl.formatMessage(messages.aboutLocation)}
              </Heading>
              <Flex direction="column" gap="4">
                <div>
                  <chakra.div fontWeight="bold">
                    {event.location.name}
                  </chakra.div>
                  <chakra.div>{event.location.address}</chakra.div>
                  <Wrap color="oaGray.500">
                    {['department', 'region', 'country'].map((part) => (
                      <WrapItem key={part}>{event.location[part]}</WrapItem>
                    ))}
                  </Wrap>
                </div>

                {event.location.description?.[contentLocale] ? (
                  <div>{nl2br(event.location.description[contentLocale])}</div>
                ) : null}

                {event.location.tags?.length ? (
                  <div>
                    <chakra.div fontWeight="bold">
                      {intl.formatMessage(messages.tags)}
                    </chakra.div>
                    {intl.formatList(
                      event.location.tags.map((tag) =>
                        getLocaleValue(tag.label, contentLocale, [
                          intl.locale,
                          FALLBACK_LOCALE,
                        ]),
                      ),
                      { style: 'narrow' },
                    )}
                  </div>
                ) : null}

                {event.location.access?.[contentLocale] ? (
                  <div>
                    <chakra.div fontWeight="bold">
                      {intl.formatMessage(messages.access)}
                    </chakra.div>
                    {event.location.access[contentLocale]}
                  </div>
                ) : null}

                {event.location.image || event.location.imageCredits ? (
                  <div>
                    {event.location.image ? (
                      <Box
                        asChild
                        pos="unset !important"
                        w="full !important"
                        h="auto !important"
                        m="auto"
                      >
                        <Image
                          src={
                            process.env.NODE_ENV === 'development'
                              ? `${DEV_S3_BUCKET}/${event.location.image}`
                              : `${S3_BUCKET}/${event.location.image}`
                          }
                          fallbackSrc={
                            process.env.NODE_ENV === 'development'
                              ? `${S3_BUCKET}/${event.location.image}`
                              : undefined
                          }
                          // >= 1038 : 659px
                          // >= 992 : 66.67vw
                          // < 992 : 100vw
                          sizes="(max-width: 992px) 100vw, (max-width: 1038px) 66.67vw, 659px"
                          loader={thumborLoader}
                          fill
                          alt=""
                          priority
                        />
                      </Box>
                    ) : null}

                    {event.location.imageCredits ? (
                      <Flex justify="flex-end" color="oaGray.500" px="2">
                        {event.location.imageCredits}
                      </Flex>
                    ) : null}
                  </div>
                ) : null}

                {event.location.website || event.location.phone ? (
                  <List.Root variant="plain" align="center" gap="2">
                    {event.location.website ? (
                      <List.Item>
                        <List.Indicator asChild verticalAlign="middle">
                          <FaIcon icon={faGlobe} size="sm" />
                        </List.Indicator>
                        <Link
                          href={event.location.website}
                          target="_blank"
                          rel="noopener nofollow"
                          wordBreak="break-all"
                        >
                          {event.location.website}
                        </Link>
                      </List.Item>
                    ) : null}

                    {event.location.phone ? (
                      <List.Item>
                        <List.Indicator asChild verticalAlign="middle">
                          <FaIcon icon={faPhone} size="sm" />
                        </List.Indicator>
                        <Link
                          href={`tel:${event.location.phone}`}
                          target="_blank"
                          rel="noopener nofollow"
                        >
                          {event.location.phone}
                        </Link>
                      </List.Item>
                    ) : null}
                  </List.Root>
                ) : null}

                {event.location.links?.length ? (
                  <chakra.div>
                    {intl.formatMessage(messages.moreLinks)}
                    <List.Root variant="plain">
                      {event.location.links?.map((link) => (
                        <List.Item key={link}>
                          <Link
                            href={link}
                            target="_blank"
                            rel="noopener nofollow"
                            wordBreak="break-all"
                          >
                            {link}
                          </Link>
                        </List.Item>
                      ))}
                    </List.Root>
                  </chakra.div>
                ) : null}

                <Map
                  width={600}
                  height={300}
                  center={[event.location.latitude, event.location.longitude]}
                  zoom={14}
                  aspectRatioProps={{
                    gridColumn: 2,
                    display: { base: 'block', lg: 'none' },
                  }}
                />
              </Flex>
            </div>
          ) : null}
        </GridItem>
      </Grid>

      {needConsentFor ? (
        <ConsentBanner
          consentFor={needConsentFor}
          consentSource="localStorage"
          display="overlay"
        />
      ) : null}

      {logo !== 'hide' ? <OAAttribution source="event" /> : null}
    </>
  );
}
