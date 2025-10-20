import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
  chakra,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Button,
  Tabs,
  ClientOnly,
  useBreakpointValue,
} from '@openagenda/uikit';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import fetchReactLocale from '@openagenda/react/fetchLocale';
import { EventShareModal } from '@openagenda/react';
import defaultStyle from 'utils/defaultStyle';
import ConsentBanner from 'components/ConsentBanner';
import CopyIdentifier from 'components/CopyIdentifier';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useClientAnalytics from 'hooks/useClientAnalytics';
import useSearchParams from 'hooks/useSearchParams';
import useSession from 'hooks/useSession';
import useUser from 'hooks/useUser';
import useLocationQuery from 'hooks/useLocationQuery';
import Featured from 'components/Featured';
import isAdminMod from '../../utils/isAdminMod';
import { useAgenda } from './contexts/agenda';
import Metas from './components/Metas';
import ContextBar from './components/ContextBar';
import LocationDetails from './components/LocationDetails';
import AgendaHeader from './components/AgendaHeader';
import AdditionalFields from './components/AdditionalFields';
import { Activities, ActivitiesList } from './components/Activities';
import Inbox from './components/Inbox';
import Sidebar, {
  ConditionsSection,
  DateRangeSection,
  OnlineAccessSection,
  RegistrationSection,
  ShareSection,
  AccessibilitySection,
} from './components/Sidebar';
import TimingsSection from './components/TimingsSection';
import Footer from './components/Footer';
import StatusTag from './components/StatusTag';
import ContributorSection from './components/ContributorSection';
import NavigateButton from './components/NavigateButton';
import EmailConfirmationAlert from './components/EmailConfirmationAlert';
import LdJson from './components/LdJson';
import EventImage from './components/EventImage';
import LongDescription from './components/LongDescription';
import * as additionalFieldsUtils from './utils/additionalFields';
import getContentLocale from './utils/getContentLocale';
import canModifyLocation from './utils/canModifyLocation';
import useEvent from './hooks/useEvent';
import useMember from './hooks/useMember';
import useShareModal from './hooks/useShareModal';
import messages from './messages';
import fetchLocale from './locales';
import useNcEffect from './hooks/useNcEffect';

export type EventShowProps = {
  preload?: string[];
};

function EventShow({ preload }: EventShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const urlQuery = useLocationQuery();
  const dateFnsLocale = useDateFnsLocale();
  const agenda = useAgenda();

  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const mailtoSettings = agenda.settings?.inbox?.mailto;

  const { user } = useUser();
  const session = useSession();

  const { event } = useEvent();
  const { me, member } = useMember();

  const languages = Object.keys(event.title);

  const searchParams = useSearchParams() as {
    cl?: string;
    sharemodal?: string;
  };
  const contentLocale = getContentLocale(
    languages,
    searchParams.cl,
    intl.locale,
  );

  const [tabValue, setTabValue] = useState(() => contentLocale);
  const handleTabsChange = (value) => {
    setTabValue(value);

    const url = new URL(router.asPath, 'https://n');
    url.searchParams.set('cl', value);
    router.replace(url.pathname + url.search, null, {
      shallow: true,
      scroll: false,
    });
  };

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

  const shareModal = urlQuery.sharemodal as string;

  const {
    shareIsOpen,
    shareOnOpen,
    shareOnClose,
    emailSent,
    emailSentIsOpen,
    emailSentOnClose,
    onEmailSent,
  } = useShareModal({
    defaultOpen: Boolean(shareModal),
    onClose: () => {
      const url = new URL(router.asPath, 'https://n');

      url.searchParams.delete('sharemodal');

      router.replace(url.pathname + url.search, null, { shallow: true });
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useNcEffect({ agendaUid: agenda.uid, eventUid: event.uid });

  const isEventContributor = member && member.userUid === me?.member?.userUid;

  const displayContextBar = isEventContributor || isAdminMod(me?.member);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const { canEditEvent = false } = me?.authorizations ?? {};

  return (
    <>
      <Metas preload={preload} contentLocale={contentLocale} />

      {displayContextBar ? (
        <Box pos="sticky" top="0" zIndex="sticky">
          <ContextBar />
        </Box>
      ) : null}
      <Box as="main">
        <Box as="header" w="full" bg="#413a42" px="4" py="8">
          <Container
            maxW="5xl"
            color="white"
            textAlign={{ base: 'center', md: 'start' }}
          >
            <AgendaHeader />
          </Container>
        </Box>

        <Flex
          as="nav"
          aria-label={intl.formatMessage(messages.eventNavigation)}
          display={{ base: 'flex', xl: 'none' }}
          justify="space-around"
          mt="8"
        >
          <NavigateButton direction="previous" />
          <NavigateButton direction="next" />
        </Flex>

        <Flex
          as="nav"
          aria-label={intl.formatMessage(messages.eventNavigation)}
          justify="center"
          mx="8"
        >
          <Box
            order="1"
            top="48"
            mt="48"
            mx="auto"
            pos="sticky"
            alignSelf="flex-start"
            minW="10em"
            textAlign="center"
            display={{ base: 'none', xl: 'block' }}
          >
            <NavigateButton direction="previous" />
          </Box>

          <Box
            order="3"
            top="48"
            mt="48"
            mx="auto"
            pos="sticky"
            alignSelf="flex-start"
            minW="10em"
            textAlign="center"
            display={{ base: 'none', xl: 'block' }}
          >
            <NavigateButton direction="next" />
          </Box>

          <Grid
            order="2"
            templateAreas={{
              base: `"event"
                    "footer"`,
              lg: `"left event sidebar"
                  "left event footer"`,
            }}
            templateColumns={{
              base: '1fr',
              lg: 'minmax(80px, 1fr) 8fr minmax(300px, 4fr)',
            }}
            templateRows="auto minmax(0, 1fr)"
            rowGap="8"
            columnGap="10"
            mt="8"
            maxW="7xl"
          >
            <GridItem area="left" display={{ base: 'none', lg: 'block' }}>
              <Flex direction="row" gap="8" mt="16">
                <Featured featured={event.featured} size="lg" />
              </Flex>
            </GridItem>
            <GridItem area="sidebar" display={{ base: 'none', lg: 'block' }}>
              <Flex direction="row" gap="8" mt="16">
                <Sidebar
                  shareOnOpen={shareOnOpen}
                  isEventContributor={isEventContributor}
                  me={me}
                />
              </Flex>
            </GridItem>

            <GridItem
              area="event"
              display="flex"
              flexDirection="column"
              gap="12"
            >
              <div>
                <Tabs.Root
                  value={tabValue}
                  onValueChange={(e) => handleTabsChange(e.value)}
                >
                  <Tabs.List>
                    {languages.map((language) => (
                      <Tabs.Trigger key={language} value={language}>
                        {language.toUpperCase()}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  {languages.map((language) => (
                    <Tabs.Content key={language} value={language} p={0}>
                      <Flex
                        display="flex"
                        direction="column"
                        gap="4"
                        position="relative"
                        p="8"
                        bg="white"
                        // border="1px solid"
                        // borderColor="oaGray.100"
                        borderRadius="sm"
                        // _hover={{
                        //   borderColor: 'primary.500',
                        // }}
                      >
                        {event.status !== 1 ? (
                          <chakra.div>
                            <StatusTag status={event.status} />
                          </chakra.div>
                        ) : null}

                        {event.title?.[language] ? (
                          <Heading as="h1" fontSize="4xl">
                            {event.title[language]}
                          </Heading>
                        ) : null}

                        {event.description?.[language] ? (
                          <Box fontSize="xl">{event.description[language]}</Box>
                        ) : null}

                        <ShareSection
                          isDisabled={!!event.private}
                          shareOnOpen={shareOnOpen}
                          display={{ base: 'grid', lg: 'none' }}
                          justifyItems="flex-start"
                        />
                        <OnlineAccessSection
                          event={event}
                          display={{ base: 'grid', lg: 'none' }}
                        />
                        <DateRangeSection
                          event={event}
                          display={{ base: 'grid', lg: 'none' }}
                        />
                        <ConditionsSection
                          event={event}
                          display={{ base: 'grid', lg: 'none' }}
                        />
                        <RegistrationSection
                          isEventContributor={isEventContributor}
                          event={event}
                          agenda={agenda}
                          display={{ base: 'grid', lg: 'none' }}
                        />
                        <AccessibilitySection
                          event={event}
                          display={{ base: 'grid', lg: 'none' }}
                        />

                        {event.image || event.imageCredits ? (
                          <chakra.div mx="-8">
                            <EventImage
                              event={event}
                              // >= 1095 : 659px
                              // >= 992 : 66.67vw
                              // < 992 : 100vw
                              sizes="(max-width: 992px) 100vw, (max-width: 1095px) 66.67vw, 659px"
                            />

                            {event.imageCredits ? (
                              <Flex
                                justify="flex-end"
                                color="oaGray.500"
                                px="2"
                              >
                                {event.imageCredits}
                              </Flex>
                            ) : null}
                          </chakra.div>
                        ) : null}

                        {event.longDescription?.[language] ? (
                          <LongDescription
                            html={event.longDescription[language]}
                            links={event.links}
                          />
                        ) : null}

                        {event.keywords?.[language]?.length ? (
                          <chakra.div color="oaGray.600" css={defaultStyle}>
                            {intl.formatList(event.keywords[language], {
                              style: 'narrow',
                            })}
                          </chakra.div>
                        ) : null}
                      </Flex>
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              </div>
              {/* timings section */}
              <Flex
                display={{ base: 'flex', lg: 'none' }}
                direction="column"
                gap="4"
                position="relative"
                p="8"
                bg="white"
                borderRadius="sm"
              >
                <TimingsSection event={event} />
              </Flex>
              {/* additional fields */}
              {hasAdditionalFields ? (
                <Flex
                  direction="column"
                  gap="4"
                  position="relative"
                  p="8"
                  bg="white"
                  borderRadius="sm"
                >
                  <AdditionalFields
                    agenda={agenda}
                    additionalFields={additionalFields}
                  />
                </Flex>
              ) : null}

              {event.location ? (
                <LocationDetails
                  location={event.location}
                  agenda={agenda}
                  contentLocale={contentLocale}
                  displayAdminMenu={canEditEvent && !isMobile}
                  displayEditAction={!canEditEvent && !isMobile}
                  canEdit={canModifyLocation(me?.member, event, agenda)}
                />
              ) : null}

              <ContributorSection contentLocale={contentLocale} />

              <Activities
                res={`/api/agendas/${agenda.uid}/events/${event.uid}/activities`}
                hideEmpty
              >
                <chakra.div css={defaultStyle}>
                  <Heading as="h2" fontSize="2xl" mb="4">
                    {intl.formatMessage(messages.history)}
                  </Heading>
                  <ActivitiesList p={8} />
                </chakra.div>
              </Activities>

              {mailtoSettings?.enabled ? (
                <div>
                  <Heading as="h2" fontSize="2xl" mb="4">
                    {intl.formatMessage(messages.contactAdministrators)}
                  </Heading>
                  <Flex bg="white" justify="space-around">
                    <Button asChild my="8">
                      <Link
                        href={`mailto:${mailtoSettings.email}?subject=${encodeURIComponent(mailtoSettings.subject)}`}
                      >
                        {intl.formatMessage(messages.sendAnEmail)}
                      </Link>
                    </Button>
                  </Flex>
                </div>
              ) : null}

              {!mailtoSettings?.enabled && session?.user ? <Inbox /> : null}
            </GridItem>

            <GridItem area="footer">
              <Box pb="2">
                <CopyIdentifier identifier={event.uid} size="sm" maxW="220px" />
              </Box>
              <Footer />
            </GridItem>
          </Grid>
        </Flex>
      </Box>
      {needConsentFor ? <ConsentBanner consentFor={needConsentFor} /> : null}

      <ClientOnly>
        {shareIsOpen ? (
          <EventShareModal
            key="sharemodal"
            isOpen
            onClose={shareOnClose}
            user={user}
            agenda={agenda}
            event={event}
            contentLocale={contentLocale}
            onEmailSent={onEmailSent}
            defaultValue={shareModal}
            rootUrl={process.env.NEXT_PUBLIC_ROOT}
          />
        ) : null}
      </ClientOnly>

      {emailSentIsOpen ? (
        <EmailConfirmationAlert
          isOpen
          onClose={emailSentOnClose}
          count={emailSent}
        />
      ) : null}

      <LdJson />
    </>
  );
}

EventShow.fetchLocale = (locale: string) =>
  Promise.all([
    fetchLocale(locale),
    // fetchErrorLocale(locale),
    fetchCommonLocale('event/fields', locale),
    fetchCommonLocale('event/states', locale),
    fetchCommonLocale('event/statuses', locale),
    fetchCommonLocale('event/accessibilities', locale),
    fetchCommonLocale('roles', locale),
    fetchReactLocale(locale),
    import(
      `@openagenda/activity-apps/src/locales-compiled/${locale}.json`
    ).then((mod) => mod.default),
  ]).then((results) => Object.assign({}, ...results));

export default EventShow;
