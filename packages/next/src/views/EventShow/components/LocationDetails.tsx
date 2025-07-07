import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import {
  Box,
  chakra,
  Flex,
  Heading,
  Link,
  List,
  WrapItem,
  Wrap,
} from '@openagenda/uikit';

import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@openagenda/uikit/snippets';

import { nl2br } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import { thumborLoader } from 'utils/imageLoader';
import { FaIcon } from 'icons';
import { faGlobe } from 'icons/regular';

import defaultSize from 'utils/defaultSize';
import defaultStyle from 'utils/defaultStyle';
import { faPhone, faChevronDown } from 'icons/solid';
import { FALLBACK_LOCALE } from 'config/constants';
import Image from 'components/Image';
import completeExternalActions from 'utils/completeExternalActions';
import messages from '../messages';

import LocationHistory from './LocationHistory';
import Map from './Map';
import FloatingButton from './FloatingButton';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

export default function LocationDetails({
  location,
  agenda,
  canEdit,
  displayAdminMenu,
  displayEditAction,
  contentLocale,
}) {
  const intl = useIntl();

  const { externalActions } = useMemo(
    () =>
      completeExternalActions(
        agenda.settings?.locations?.extIds,
        location?.extIds,
      ),
    [agenda, location],
  );

  // Filter external actions for edit actions
  const externalEditActions = useMemo(() => {
    if (!externalActions || !Array.isArray(externalActions)) return [];
    return externalActions.filter((action) => action.action === 'edit');
  }, [externalActions]);
  return (
    <div>
      <Heading as="h2" fontSize="2xl" mb="4">
        {intl.formatMessage(messages.aboutLocation)}
      </Heading>
      <Flex
        direction="column"
        gap="4"
        position="relative"
        p="8"
        bg="white"
        borderRadius="sm"
      >
        {displayAdminMenu ? (
          <MenuRoot>
            <MenuTrigger asChild>
              <FloatingButton>
                {intl.formatMessage(messages.edit)}
                <FaIcon icon={faChevronDown} />
              </FloatingButton>
            </MenuTrigger>
            <MenuContent minW="3xs">
              {externalEditActions.length > 0 ? 
                externalEditActions.map((action, index) => (
                  <MenuItem
                    asChild
                    value={`external-edit-${index}`}
                    key={`external-edit-${index}`}
                  >
                    <Link
                      unstyled
                      href={action.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {intl.formatMessage(messages.suggestLocationChange)}
                      <i
                        className="fa fa-external-link"
                        aria-hidden="true"
                        style={{ marginLeft: '8px' }}
                      />
                    </Link>
                  </MenuItem>
                ))
               : (
                <MenuItem asChild value="edit-location">
                  {canEdit ? (
                    <Link
                      unstyled
                      href={`/${agenda.slug}/admin/locations/${location.uid}/edit`}
                    >
                      {intl.formatMessage(messages.editLocation)}
                    </Link>
                  ) : (
                    <Link
                      unstyled
                      href={`/${agenda.slug}/locations/${location.agendaUid}.${location.uid}/suggest-change`}
                    >
                      {intl.formatMessage(messages.suggestLocationChange)}
                    </Link>
                  )}
                </MenuItem>
              )}
              <MenuItem asChild value="location-history">
                <LocationHistory />
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        ) : null}
        {displayEditAction ? (
          <FloatingButton asChild>
            {externalEditActions.length > 0 ? (
              <Link
                unstyled
                href={externalEditActions[0].link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(messages.suggestLocationChange)}
                <i
                  className="fa fa-external-link"
                  aria-hidden="true"
                  style={{ marginLeft: '8px' }}
                />
              </Link>
            ) : (
              <Link
                unstyled
                href={
                  canEdit
                    ? `/${agenda.slug}/admin/locations/${location.uid}/edit`
                    : `/${agenda.slug}/locations/${location.agendaUid}.${location.uid}/suggest-change`
                }
              >
                {intl.formatMessage(
                  canEdit
                    ? messages.editLocation
                    : messages.suggestLocationChange,
                )}
              </Link>
            )}
          </FloatingButton>
        ) : null}

        <div>
          <chakra.div fontSize={defaultSize} fontWeight="bold">
            {location.name}
          </chakra.div>
          <chakra.div fontSize={defaultSize}>{location.address}</chakra.div>
          <Wrap color="oaGray.500">
            {['department', 'region', 'country'].map((part) => (
              <WrapItem fontSize={defaultSize} key={part}>
                {location[part]}
              </WrapItem>
            ))}
          </Wrap>
        </div>

        {location.description?.[contentLocale] ? (
          <chakra.div css={defaultStyle}>
            {nl2br(location.description[contentLocale])}
          </chakra.div>
        ) : null}

        {location.tags?.length ? (
          <chakra.div css={defaultStyle}>
            <chakra.div fontWeight="bold">
              {intl.formatMessage(messages.tags)}
            </chakra.div>
            {intl.formatList(
              location.tags.map((tag) =>
                getLocaleValue(tag.label, contentLocale, [
                  intl.locale,
                  FALLBACK_LOCALE,
                ]),
              ),
              { style: 'narrow' },
            )}
          </chakra.div>
        ) : null}

        {location.access?.[contentLocale] ? (
          <chakra.div css={defaultStyle}>
            <chakra.div fontWeight="bold">
              {intl.formatMessage(messages.access)}
            </chakra.div>
            {location.access[contentLocale]}
          </chakra.div>
        ) : null}

        {location.image || location.imageCredits ? (
          <chakra.div css={defaultStyle}>
            {location.image ? (
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
                      ? `${DEV_S3_BUCKET}/${location.image}`
                      : `${S3_BUCKET}/${location.image}`
                  }
                  fallbackSrc={
                    process.env.NODE_ENV === 'development'
                      ? `${S3_BUCKET}/${location.image}`
                      : undefined
                  }
                  fill
                  // >= 1095 : 659px
                  // >= 992 : 66.67vw
                  // < 992 : 100vw
                  sizes="(max-width: 992px) 100vw, (max-width: 1095px) 66.67vw, 659px"
                  loader={thumborLoader}
                  alt=""
                  priority
                />
              </Box>
            ) : null}

            {location.imageCredits ? (
              <Flex justify="flex-end" color="oaGray.500" px="2">
                {location.imageCredits}
              </Flex>
            ) : null}
          </chakra.div>
        ) : null}

        {location.website || location.phone ? (
          <List.Root variant="plain" gap="2" align="center">
            {location.website ? (
              <List.Item>
                <List.Indicator asChild>
                  <FaIcon size="sm" icon={faGlobe} />
                </List.Indicator>
                <Link
                  href={location.website}
                  target="_blank"
                  rel="noopener nofollow"
                  wordBreak="break-all"
                >
                  {location.website}
                </Link>
              </List.Item>
            ) : null}

            {location.phone ? (
              <List.Item>
                <List.Indicator asChild>
                  <FaIcon size="sm" icon={faPhone} />
                </List.Indicator>
                <Link
                  href={`tel:${location.phone}`}
                  target="_blank"
                  rel="noopener nofollow"
                >
                  {location.phone}
                </Link>
              </List.Item>
            ) : null}
          </List.Root>
        ) : null}

        {location.links?.length ? (
          <chakra.div>
            <chakra.div css={defaultStyle}>
              <b>{intl.formatMessage(messages.moreLinks)}</b>
            </chakra.div>
            <List.Root variant="plain">
              {location.links?.map((link) => (
                <List.Item asChild key={link}>
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
          center={[location.latitude, location.longitude]}
          zoom={14}
          aspectRatioProps={{
            gridColumn: 2,
            display: { base: 'block', lg: 'none' },
          }}
        />
      </Flex>
    </div>
  );
}
