import { Box, HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import { useIntl } from 'react-intl';
import OfficialAgenda from '../OfficialAgenda';
import LockIcon from '../LockIcon';
import { useImageWithFallback } from '../../hooks/useImageWithFallback';
import { THUMBOR_PREFIX, GRAYLOGO140 } from '../../config/constants';
import messages from './messages';

const isDev = process.env.NODE_ENV === 'development';

function getImageSrc(image) {
  if (!image) return null;

  return isDev
    ? `${THUMBOR_PREFIX}dev/${image}`
    : `${THUMBOR_PREFIX}main/${image}`;
}

export default function AgendaItem({ agenda, targetAgenda, event }) {
  const imageSrc = getImageSrc(targetAgenda.image);

  const image = useImageWithFallback({
    src: imageSrc || GRAYLOGO140,
    fallbackSrc:
      isDev && typeof imageSrc === 'string'
        ? imageSrc.replace('dev', 'main').replace('images-', 'imagesdev-')
        : undefined,
  });

  const intl = useIntl();
  const isAdminMod = targetAgenda.member
    && (targetAgenda.member.role === 2 || targetAgenda.member.role === 3);
  const targetAgendaIsClosed = targetAgenda.settings?.contribution?.type === 0;
  const shouldDisable = targetAgendaIsClosed && !isAdminMod;

  const linkContent = (
    <Box
      css={
        shouldDisable
          ? {
            cursor: 'not-allowed',
          }
          : undefined
      }
    >
      <Link
        href={`/${targetAgenda.slug}/contribute/event/${event.uid}/from/${agenda.uid}`}
        color="fg"
        css={
          shouldDisable
            ? {
              opacity: 0.5,
              pointerEvents: 'none',
            }
            : undefined
        }
        aria-disabled={shouldDisable}
        tabIndex={shouldDisable ? -1 : undefined}
        onClick={shouldDisable ? (e) => e.preventDefault() : undefined}
      >
        <HStack>
          <Box
            asChild
            borderRadius="full"
            border="3px solid white"
            h="40px"
            minW="40px"
            objectFit="cover"
          >
            <img
              width="40"
              height="40"
              src={image.src}
              onLoad={image.onLoad}
              onError={image.onError}
              alt=""
              draggable={false}
            />
            {/* <Image */}
            {/*   width="40" */}
            {/*   height="40" */}
            {/*   src={imageSrc || GRAYLOGO140} */}
            {/*   fallbackSrc={ */}
            {/*     isDev && typeof imageSrc === 'string' */}
            {/*       ? imageSrc */}
            {/*         .replace('dev', 'main') */}
            {/*         .replace('images-', 'imagesdev-') */}
            {/*       : undefined */}
            {/*   } */}
            {/*   alt="" */}
            {/*   draggable={false} */}
            {/*   loader={imageSrc ? thumborLoader : null} */}
            {/* /> */}
          </Box>

          <Text fontSize="lg">
            {targetAgenda.title}
            {targetAgenda.official ? (
              <NoBreak>
                <OfficialAgenda
                  ml="2"
                  tooltipProps={{
                    contentProps: {
                      css: { '--tooltip-bg': 'black' },
                      color: 'white',
                    },
                  }}
                />
              </NoBreak>
            ) : null}
            {targetAgenda.private ? (
              <NoBreak>
                <LockIcon
                  type="agenda"
                  ml="2"
                  tooltipProps={{
                    contentProps: {
                      css: { '--tooltip-bg': 'black' },
                      color: 'white',
                    },
                  }}
                />
              </NoBreak>
            ) : null}
          </Text>
        </HStack>
      </Link>
    </Box>
  );

  return shouldDisable ? (
    <Tooltip
      content={intl.formatMessage(messages.agendaClosedToContribution)}
      positioning={{ placement: 'top' }}
      showArrow
      contentProps={{
        css: { '--tooltip-bg': 'black' },
        color: 'white',
      }}
      openDelay={0}
      closeDelay={0}
    >
      {linkContent}
    </Tooltip>
  )
    : linkContent;
}
