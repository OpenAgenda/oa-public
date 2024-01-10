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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/pro-regular-svg-icons';
import { faPhone } from '@fortawesome/pro-solid-svg-icons';
import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import Image from 'components/Image';
import ConsentBanner from 'components/ConsentBanner';
import keyCDNLoader from 'utils/keyCDNLoader';
import { FetchStatus } from 'config/types';
import useDateFnsLocale from 'hooks/useDateFnsLocale';
import useMatomoTracker from 'hooks/useMatomoTracker';
import useClientAnalytics from 'hooks/useClientAnalytics';
import useSearchParams from 'hooks/useSearchParams';
import useSession from 'hooks/useSession';
import { useAgenda } from './contexts/agenda';
import Metas from './components/Metas';
import ContextBar from './components/ContextBar';
import AgendaHeader from './components/AgendaHeader';
import AdditionalFields from './components/AdditionalFields';
import Activities from './components/Activities';
import Inbox from './components/Inbox';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import StatusTag from './components/StatusTag';
import * as additionalFieldsUtils from './utils/additionalFields';
import getContentLocale from './utils/getContentLocale';
import useEvent from './hooks/useEvent';
import useMember from './hooks/useMember';
import fetchLocale from './locales';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export type EventShowProps = {
  preload?: string[]
};

function SuggestLocationChangeButton() {
  const agenda = useAgenda();
  const { event } = useEvent();
  const { member, status } = useMember();

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = member && ['administrator', 'moderator'].includes(member.role);

  if (isAdminMod) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/locations/${event.uid}.${event.location.uid}/suggest-change`}
      variant="outline"
      alignSelf="flex-start"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
    >
      Suggérer une modification de lieu
    </Button>
  );
}

function EditLocationButton() {
  const { member, status } = useMember();

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = member && ['administrator', 'moderator'].includes(member.role);

  if (!isAdminMod) return null;

  return (
    <Button
      as={Link}
      href={`${agenda.slug}/admin/locations/${event.location.uid}/edit`}
      // leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
      variant="outline"
      // colorScheme="white"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
      position="absolute"
      top="6"
      right="6"
    >
      Éditer le lieu
    </Button>
  );
}

function EventShow({ preload }: EventShowProps) {
  const intl = useIntl();
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale();
  const agenda = useAgenda();

  useMatomoTracker();
  const needConsentFor = useClientAnalytics(agenda.settings?.tracking);

  const mailtoSettings = agenda.settings?.inbox?.mailto;

  const session = useSession();

  const { event } = useEvent();
  const { member } = useMember();

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

  const isOwner = event.ownerUid === member?.uid;
  const isAdminMod = member?.role === 'administrator' || member?.role === 'moderator';

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

      <Grid
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
        m="auto"
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
              <Heading as="h2" fontSize="2xl" mb="4">À propos du lieu</Heading>
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
                      Tags:&nbsp;
                    </chakra.span>
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
                      Accés:&nbsp;
                    </chakra.span>
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
                        <ListIcon as={FontAwesomeIcon} icon={faGlobe} verticalAlign="middle" />
                        <Link isExternal href={event.location.website} colorScheme="primary">
                          {event.location.website}
                        </Link>
                      </ListItem>
                    ) : null}

                    {event.location.phone ? (
                      <ListItem>
                        <ListIcon as={FontAwesomeIcon} icon={faPhone} verticalAlign="middle" />
                        <Link isExternal href={`tel:${event.location.phone}`} colorScheme="primary">
                          {event.location.phone}
                        </Link>
                      </ListItem>
                    ) : null}
                  </List>
                ) : null}

                {event.location.links?.length ? (
                  <chakra.div>
                    Plus de liens:
                    <List>
                      {event.location.links?.map(link => (
                        <ListItem key={link}>
                          <Link isExternal href={link} colorScheme="primary">
                            {link}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </chakra.div>
                ) : null}

                <SuggestLocationChangeButton />
              </Flex>
            </div>
          ) : null}

          <Activities />

          {mailtoSettings?.enabled ? (
            <div>
              <Heading as="h2" fontSize="2xl" mb="4">
                Contacter les administrateurs
              </Heading>
              <Flex bg="white" justify="space-around">
                <Button
                  as={Link}
                  href={`mailto:${mailtoSettings.email}?subject=${encodeURIComponent(mailtoSettings.subject)}`}
                  variant="solid"
                  colorScheme="primary"
                  my="8"
                >
                  Envoyer un email
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

      {needConsentFor ? (
        <ConsentBanner consentFor={needConsentFor} />
      ) : null}

      <div>
        <h1>Une autre page NextJs</h1>
        <h2>L&apos;événement: {flatten(event.title)}</h2>
        <h3>L&apos;agenda: {agenda.title}</h3>
        <pre>
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </>
  );
}

EventShow.fetchLocale = locale => Promise.all([
  fetchLocale(locale),
  // fetchErrorLocale(locale),
  fetchCommonLocale('event/fields', locale),
  fetchCommonLocale('event/states', locale),
  import(`@openagenda/activity-apps/src/locales-compiled/${locale}.json`).then(mod => mod.default),
]).then(results => Object.assign({}, ...results));

export default EventShow;
