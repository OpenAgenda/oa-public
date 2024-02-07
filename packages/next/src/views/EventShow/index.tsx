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
  List,
  ListItem,
  ListIcon,
  Tabs,
  TabList,
  Tab,
} from '@openagenda/uikit';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import { FaIcon } from 'icons';
import { faGlobe } from 'icons/regular';
import { faPhone } from 'icons/solid';
import Image from 'components/Image';
import ConsentBanner from 'components/ConsentBanner';
import keyCDNLoader from 'utils/keyCDNLoader';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useClientAnalytics from 'hooks/useClientAnalytics';
import useSearchParams from 'hooks/useSearchParams';
import useSession from 'hooks/useSession';
import { useAgenda } from './contexts/agenda';
import Metas from './components/Metas';
import ContextBar from './components/ContextBar';
import AgendaHeader from './components/AgendaHeader';
import AdditionalFields from './components/AdditionalFields';
import { Activities, ActivitiesList } from './components/Activities';
import Inbox from './components/Inbox';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import StatusTag from './components/StatusTag';
import ContributorSection from './components/ContributorSection';
import NavigateButton from './components/NavigateButton';
import SuggestLocationChangeButton from './components/SuggestLocationChangeButton';
import EditLocationButton from './components/EditLocationButton';
import LocationHistory from './components/LocationHistory';
import * as additionalFieldsUtils from './utils/additionalFields';
import getContentLocale from './utils/getContentLocale';
import useEvent from './hooks/useEvent';
import useMember from './hooks/useMember';
import messages from './messages';
import fetchLocale from './locales';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

export type EventShowProps = {
  preload?: string[]
};

function EventShow({ preload }: EventShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const agenda = useAgenda();

  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const mailtoSettings = agenda.settings?.inbox?.mailto;

  const session = useSession();

  const { event } = useEvent();
  const { me } = useMember();

  const languages = Object.keys(event.title);

  const { cl } = useSearchParams() as { cl?: string };
  const contentLocale = getContentLocale(languages, cl, intl.locale);

  const [tabIndex, setTabIndex] = useState(() => languages.indexOf(contentLocale));
  const handleTabsChange = index => {
    setTabIndex(index);

    const url = new URL(router.asPath, 'https://n');
    url.searchParams.set('cl', languages[index]);
    router.replace(
      url.pathname + url.search,
      null,
      { shallow: true, scroll: false },
    );
  };

  const hasAdditionalFields = useMemo(
    () => additionalFieldsUtils.hasAdditionalFields(agenda.schema),
    [agenda.schema],
  );

  const additionalFields = useMemo(
    () => additionalFieldsUtils.formatAdditionalFieldData({
      schema: agenda.schema,
      event,
      locale: contentLocale,
      defaultLocale: intl.locale,
      dateFnsLocale,
    }),
    [agenda.schema, dateFnsLocale, event, contentLocale, intl.locale],
  );

  const isOwner = event.ownerUid === me?.member?.uid;
  const isAdminMod = me?.member?.role === 'administrator' || me?.member?.role === 'moderator';

  const displayContextBar = isOwner || isAdminMod;

  return (
    <>
      <Metas preload={preload} />

      {displayContextBar ? (
        <Box pos="sticky" top="0" zIndex="sticky">
          <ContextBar />
        </Box>
      ) : null}

      <Box as="header" w="full" bg="#413a42" px="4" py="8">
        <Container maxW="container.lg" color="white">
          <AgendaHeader />
        </Container>
      </Box>

      <Flex>
        <Box
          order="1"
          top="48"
          mt="48"
          mx="auto"
          pos="sticky"
          alignSelf="flex-start"
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
        >
          <NavigateButton direction="next" />
        </Box>

        <Grid
          order="2"
          templateAreas={{
            base: `"sidebar"
                 "event"
                 "footer"`,
            lg: `"event sidebar"
                 "event footer"`,
          }}
          gridTemplateColumns={{
            base: '1fr',
            lg: '2fr minmax(300px, 1fr)',
          }}
          gridTemplateRows="auto minmax(0, 1fr)"
          rowGap="8"
          columnGap="10"
          pt="8"
          maxW="container.lg"
        >

          <GridItem area="sidebar">
            <Flex direction="row" gap="8" mt="16">
              <Sidebar contentLocale={contentLocale} />
            </Flex>
          </GridItem>

          <GridItem area="event" display="flex" flexDirection="column" gap="12">
            <div>
              <Tabs index={tabIndex} onChange={handleTabsChange} colorScheme="primary">
                <TabList>
                  {languages.map(language => (
                    <Tab key={language}>{language.toUpperCase()}</Tab>
                  ))}
                </TabList>
              </Tabs>

              <Flex
                as="main"
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

                {event.title?.[contentLocale] ? (
                  <Heading as="h1" fontSize="4xl">
                    {event.title[contentLocale]}
                  </Heading>
                ) : null}

                {event.description?.[contentLocale] ? (
                  <Box fontSize="xl">
                    {event.description[contentLocale]}
                  </Box>
                ) : null}

                <chakra.div mx="-8">
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {event.image
                    ? event.image?.size?.width && event.image?.size?.height ? (
                      <Image
                        src={process.env.NODE_ENV === 'development'
                          ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
                          : `${IMAGE_PREFIX}${event.image.filename}`}
                        fallbackSrc={process.env.NODE_ENV === 'development'
                          ? `${IMAGE_PREFIX}${event.image.filename}`
                          : undefined}
                        fallbackStrategy="onError"
                        width={event.image.size.width}
                        height={event.image.size.height}
                        loader={keyCDNLoader}
                        alt=""
                        m="auto"
                        w="full"
                        priority
                      />
                    ) : (
                      <Image
                        src={process.env.NODE_ENV === 'development'
                          ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
                          : `${IMAGE_PREFIX}${event.image.filename}`}
                        fallbackSrc={process.env.NODE_ENV === 'development'
                          ? `${IMAGE_PREFIX}${event.image.filename}`
                          : undefined}
                        fallbackStrategy="onError"
                        fill
                        // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
                        pos="unset !important"
                        w="full !important"
                        h="auto !important"
                        loader={keyCDNLoader}
                        alt=""
                        m="auto"
                        priority
                      />
                    )
                    : null}

                  {event.imageCredits ? (
                    <Flex justify="flex-end" color="oaGray.500" px="2">
                      {event.imageCredits}
                    </Flex>
                  ) : null}
                </chakra.div>

                {event.longDescription?.[contentLocale] ? (
                  <chakra.div
                    sx={{
                      ul: {
                        ps: '40px',
                        mb: '10px',
                      },
                      p: {
                        mb: '10px',
                        _last: {
                          mb: '0',
                        },
                      },
                      a: {
                        color: 'primary.500',
                        _hover: {
                          color: 'primary.600',
                          textDecoration: 'underline',
                        },
                      },
                    }}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: event.longDescription[contentLocale] }}
                  />
                ) : null}

                {event.keywords?.[contentLocale]?.length ? (
                  <chakra.div px={8} color="oaGray.500">
                    {intl.formatList(event.keywords[contentLocale], { style: 'narrow' })}
                  </chakra.div>
                ) : null}
              </Flex>
            </div>

            {/* additional fields */}
            {hasAdditionalFields ? (
              <Flex
                display="flex"
                direction="column"
                gap="4"
                position="relative"
                // mt="8"
                // py="4"
                p="8"
                bg="white"
                // border="1px solid"
                // borderColor="oaGray.100"
                borderRadius="sm"
                // _hover={{
                //   borderColor: 'primary.500',
                // }}
              >
                <AdditionalFields
                  additionalFields={additionalFields}
                  updatedAt={event.updatedAt !== event.createdAt ? event.updatedAt : null}
                />
              </Flex>
            ) : null}

            {/* location */}
            {event.location ? (
              <div>
                <Heading as="h2" fontSize="2xl" mb="4">{intl.formatMessage(messages.aboutLocation)}</Heading>
                <Flex
                  display="flex"
                  direction="column"
                  gap="4"
                  position="relative"
                  // mt="8"
                  // py="4"
                  p="8"
                  bg="white"
                  // border="1px solid"
                  // borderColor="oaGray.100"
                  borderRadius="sm"
                  // _hover={{
                  //   borderColor: 'primary.500',
                  // }}
                >
                  {event.location.agendaUid === agenda.uid ? (
                    <EditLocationButton />
                  ) : null}

                  <div>
                    <chakra.div fontWeight="bold">
                      {event.location.name}
                    </chakra.div>
                    <chakra.div>
                      {event.location.address}
                    </chakra.div>
                  </div>

                  {event.location.tags?.length ? (
                    <div>
                      <chakra.span fontWeight="bold">
                        {intl.formatMessage(messages.tags)}
                      </chakra.span>
                      &nbsp;
                      {intl.formatList(event.location.tags.map(tag => tag.label), { style: 'narrow' })}
                    </div>
                  ) : null}

                  {event.location.description?.[contentLocale] ? (
                    <div>
                      {event.location.description[contentLocale]}
                    </div>
                  ) : null}

                  {event.location.access?.[contentLocale] ? (
                    <div>
                      <chakra.span fontWeight="bold">
                        {intl.formatMessage(messages.access)}
                      </chakra.span>
                      &nbsp;
                      {event.location.access[contentLocale]}
                    </div>
                  ) : null}

                  {event.location.image || event.location.imageCredits ? (
                    <div>
                      {event.location.image ? (
                        <Image
                          src={process.env.NODE_ENV === 'development'
                            ? `${DEV_IMAGE_PREFIX}${event.location.image}`
                            : `${IMAGE_PREFIX}${event.location.image}`}
                          fallbackSrc={process.env.NODE_ENV === 'development'
                            ? `${IMAGE_PREFIX}${event.location.image}`
                            : undefined}
                          fallbackStrategy="onError"
                          fill
                          // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
                          pos="unset !important"
                          w="full !important"
                          h="auto !important"
                          loader={keyCDNLoader}
                          alt=""
                          m="auto"
                          priority
                        />
                      ) : null}

                      {event.location.imageCredits ? (
                        <Flex justify="flex-end" color="oaGray.500" px="2">
                          {event.location.imageCredits}
                        </Flex>
                      ) : null}
                    </div>
                  ) : null}

                  {event.location.website || event.location.phone ? (
                    <List spacing="2">
                      {event.location.website ? (
                        <ListItem>
                          <ListIcon as={FaIcon} icon={faGlobe} verticalAlign="middle" />
                          <Link
                            isExternal
                            href={event.location.website}
                            colorScheme="primary"
                            wordBreak="break-all"
                          >
                            {event.location.website}
                          </Link>
                        </ListItem>
                      ) : null}

                      {event.location.phone ? (
                        <ListItem>
                          <ListIcon as={FaIcon} icon={faPhone} verticalAlign="middle" />
                          <Link isExternal href={`tel:${event.location.phone}`} colorScheme="primary">
                            {event.location.phone}
                          </Link>
                        </ListItem>
                      ) : null}
                    </List>
                  ) : null}

                  {event.location.links?.length ? (
                    <chakra.div>
                      {intl.formatMessage(messages.moreLinks)}
                      <List>
                        {event.location.links?.map(link => (
                          <ListItem key={link}>
                            <Link
                              isExternal
                              href={link}
                              colorScheme="primary"
                              wordBreak="break-all"
                            >
                              {link}
                            </Link>
                          </ListItem>
                        ))}
                      </List>
                    </chakra.div>
                  ) : null}

                  <SuggestLocationChangeButton />

                  <LocationHistory />
                </Flex>
              </div>
            ) : null}

            <ContributorSection contentLocale={contentLocale} />

            <Activities
              res={`/agendas/${agenda.uid}/events/${event.uid}/activities`}
              hideEmpty
            >
              <div>
                <Heading as="h2" fontSize="2xl" mb="4">{intl.formatMessage(messages.history)}</Heading>
                <ActivitiesList p={8} />
              </div>
            </Activities>

            {mailtoSettings?.enabled ? (
              <div>
                <Heading as="h2" fontSize="2xl" mb="4">
                  {intl.formatMessage(messages.contactAdministrators)}
                </Heading>
                <Flex bg="white" justify="space-around">
                  <Button
                    as={Link}
                    href={`mailto:${mailtoSettings.email}?subject=${encodeURIComponent(mailtoSettings.subject)}`}
                    variant="solid"
                    colorScheme="primary"
                    my="8"
                  >
                    {intl.formatMessage(messages.sendAnEmail)}
                  </Button>
                </Flex>
              </div>
            ) : null}

            {!mailtoSettings?.enabled && session?.user ? (
              <Inbox />
            ) : null}
          </GridItem>

          <GridItem area="footer">
            <Footer />
          </GridItem>
        </Grid>
      </Flex>

      {needConsentFor ? (
        <ConsentBanner consentFor={needConsentFor} />
      ) : null}

      {/* <div>
        <h1>Une autre page NextJs</h1>
        <h2>L&apos;événement: {flatten(event.title)}</h2>
        <h3>L&apos;agenda: {agenda.title}</h3>
        <pre>
          {JSON.stringify(event, null, 2)}
        </pre>
      </div> */}
    </>
  );
}

EventShow.fetchLocale = locale => Promise.all([
  fetchLocale(locale),
  // fetchErrorLocale(locale),
  fetchCommonLocale('event/fields', locale),
  fetchCommonLocale('event/states', locale),
  fetchCommonLocale('event/statuses', locale),
  import(`@openagenda/activity-apps/src/locales-compiled/${locale}.json`).then(mod => mod.default),
]).then(results => Object.assign({}, ...results));

export default EventShow;
