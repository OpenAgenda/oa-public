import { Fragment, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Flex,
  Icon,
  Button,
  Wrap,
  WrapItem,
  Grid,
  Box,
  Tag,
  HStack,
  Link,
  useDisclosure,
} from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import { FaIcon } from 'icons';
import { faShareNodes, faEnvelope, faClock, faSquareCheck, faLocationDot } from 'icons/regular';
import { faLink, faClockRotateLeft, faTicket, faPhone } from 'icons/solid';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import Timings from './Timings';
import References from './References';
import Map from './Map';
import ShareModal from './ShareModal';
import EmailConfirmationAlert from './EmailConfirmationAlert';

function getRegistrationIcon(type: string) {
  switch (type) {
    case 'phone':
      return faPhone;
    case 'link':
      return faLink;
    case 'email':
      return faEnvelope;
    default:
      return null;
  }
}

function getRegistrationLink({ value, type }: { value: string, type: string }) {
  switch (type) {
    case 'phone':
      return `tel:${value}`;
    case 'link':
      return value;
    case 'email':
      return `mailto:${value}`;
    default:
      return '#';
  }
}

export default function Sidebar({ contentLocale }) {
  const intl = useIntl();

  const agenda = useAgenda();
  const { event } = useEvent();

  const isUpcoming = useMemo(() => {
    const now = new Date();
    return event.timings.some(timing => new Date(timing.end) > now);
  }, [event.timings]);

  const canShare = !event.private && event.state === 2;

  const {
    isOpen: shareIsOpen,
    onOpen: shareOnOpen,
    onClose: shareOnClose,
  } = useDisclosure();

  const [emailSent, setEmailSent] = useState(0);
  const {
    isOpen: emailSentIsOpen,
    onOpen: emailSentOnOpen,
    onClose: emailSentOnClose,
  } = useDisclosure();

  const onEmailSent = count => {
    setEmailSent(count);
    emailSentOnOpen();
  };

  return (
    <Flex
      gap="8"
      direction="column"
      grow="1"
      // w={{ base: 'full', xl: '75%' }}
      // px={{ base: '4', xl: '0' }}
    >
      <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
        <Icon
          as={FaIcon}
          icon={faShareNodes}
          size="2xl"
          color="oaGray.300"
          mt="1"
        />
        <Button
          onClick={shareOnOpen}
          // leftIcon={<OAIcon />}
          variant="solid"
          colorScheme="primary"
          isDisabled={!canShare}
        >
          Partager
        </Button>
        {/* <Wrap gridColumn="2" mt="2" align="center">
          <WrapItem>Autres partages:</WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faFacebookF} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faTwitter} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faLinkedinIn} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faEnvelope} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faPrint} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
          <WrapItem>
            <IconButton
              aria-label="" // TODO
              variant="link"
              // colorScheme={canShare ? 'primary' : 'oaGray'}
              color="oaGray.500"
              _hover={{
                color: canShare ? 'primary.500' : null,
              }}
              icon={<FaIcon icon={faLink} />}
              isDisabled={!canShare}
              fontSize="lg"
              minW="1em"
            />
          </WrapItem>
        </Wrap> */}
      </Grid>

      {/* <Flex direction="row" gap="4" align="center" grow="1">
        <Icon
          as={FaIcon}
          icon={faClockRotateLeft}
          size="2xl"
          color="oaGray.300"
        />
        <div>
          {getLocaleValue(event.dateRange, intl.locale)}
        </div>
      </Flex> */}

      {event.onlineAccessLink ? (
        <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
          <Icon
            as={FaIcon}
            icon={faLink}
            size="2xl"
            color="oaGray.300"
          />
          <Link isExternal href={event.onlineAccessLink} colorScheme="primary">
            Accéder à l&apos;événement en ligne
          </Link>
        </Grid>
      ) : null}

      <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
        <Icon
          as={FaIcon}
          icon={isUpcoming ? faClock : faClockRotateLeft}
          size="2xl"
          color="oaGray.300"
        />
        <HStack>
          <span>{getLocaleValue(event.dateRange, intl.locale)}</span>
          {!event.nextTiming ? (
            <Tag
              borderRadius="full"
              variant="outline"
              colorScheme="oaGray"
            >
              <b>Passé</b>
            </Tag>
          ) : null}
        </HStack>
      </Grid>

      {event.conditions?.[intl.locale] ? (
        <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
          <Icon
            as={FaIcon}
            icon={faTicket}
            size="2xl"
            color="oaGray.300"
          />
          <Box fontSize="lg" color="oaGray.500">
            Conditions
          </Box>
          <Box gridColumn="2">{event.conditions[intl.locale]}</Box>
        </Grid>
      ) : null}

      {event.registration?.length || event.passCulture ? (
        <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
          <Icon
            as={FaIcon}
            icon={faSquareCheck}
            size="2xl"
            color="oaGray.300"
          />
          <Box fontSize="lg" color="oaGray.500">
            Registration
          </Box>
          {event.registration.map(registrationItem => (
            <Fragment key={registrationItem.value}>
              <Icon
                as={FaIcon}
                icon={getRegistrationIcon(registrationItem.type)}
                color="oaGray.300"
                justifySelf="end"
              />
              <Link isExternal href={getRegistrationLink(registrationItem)} colorScheme="primary">
                {registrationItem.type === 'link' ? 'S\'inscrire / réserver :' : ''}
                {registrationItem.value}
              </Link>
            </Fragment>
          ))}
          {event.passCulture ? (
            <Button
              as={Link}
              href={event.passCulture.value}
              isExternal
              gridColumn="2"
              variant="outline"
              bg="white"
              borderColor="oaGray.300"
              color="blackAlpha.800"
              _hover={{
                bg: 'oaGray.100',
                color: 'blackAlpha.900',
                textDecoration: 'none',
              }}
              leftIcon={<img src="https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png" alt="" />}
              justifySelf="start"
            >
              Accéder à l&apos;offre pass Culture
            </Button>
          ) : null}
        </Grid>
      ) : null}

      <Box ml="12">
        <Timings timings={event.timings} timezone={event.timezone} />
      </Box>

      {event.location?.latitude && event.location?.longitude ? (
        <Grid templateColumns="2em 1fr" columnGap="4" rowGap="1" alignItems="center">
          <Icon
            as={FaIcon}
            icon={faLocationDot}
            size="2xl"
            color="oaGray.300"
          />
          <Box>
            <p>{event.location.name}</p>
            <Link
              isExternal
              href={`https://www.openstreetmap.org/directions?to=${event.location.latitude}%2C${event.location.longitude}`}
              colorScheme="primary"
            >
              {event.location.address}
            </Link>
            <Wrap color="oaGray.500">
              {['department', 'region', 'country'].map(part => (
                <WrapItem key={part}>
                  {event.location[part]}
                </WrapItem>
              ))}
            </Wrap>
          </Box>
          <Map
            width={300}
            height={200}
            center={[event.location.latitude, event.location.longitude]}
            zoom={14}
            aspectRatioProps={{ gridColumn: 2 }}
          />
        </Grid>
      ) : null}

      <Box ml="12">
        <References agenda={agenda} event={event} />
      </Box>

      {shareIsOpen ? (
        <ShareModal
          isOpen
          onClose={shareOnClose}
          agenda={agenda}
          event={event}
          contentLocale={contentLocale}
          onEmailSent={onEmailSent}
        />
      ) : null}

      {emailSentIsOpen ? (
        <EmailConfirmationAlert
          isOpen
          onClose={emailSentOnClose}
          count={emailSent}
        />
      ) : null}
    </Flex>
  );
}

// https://openagenda.com/ndm/events/visite-libre-de-lexposition-tarz-broder-au-maroc-hier-et-aujourdhui?admin_nav%5Bq.search%5D=atelier&admin_nav%5Bq.sort%5D=score&admin_nav%5Bpage%5D=3&admin_nav%5Bindex%5D=0
