import { useRouter } from 'next/router';
import qs from 'qs';
import { Box, HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { thumborLoader } from 'utils/imageLoader';
import graylogo140 from '../../../../../public/images/graylogo140.png';

const isDev = process.env.NODE_ENV === 'development';

function getImageSrc(image) {
  if (!image) return null;

  return isDev
    ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${image}`
    : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${image}`;
}

export default function AgendaItem({ agenda, targetAgenda }) {
  const router = useRouter();

  const url = new URL(router.asPath, 'https://n');
  // const redirectUrlPart = Buffer.from(url.pathname).toString('base64');
  const imageSrc = getImageSrc(targetAgenda.image);

  return (
    <Link
      color="fg"
      href={`/${targetAgenda.slug}/admin/sources?${qs.stringify({
        source: agenda.slug,
        redirect: url.pathname,
      })}`}
    >
      <HStack>
        <Box
          asChild
          rounded="full"
          border="3px solid white"
          h="40px"
          minW="40px"
          objectFit="cover"
        >
          <Image
            width="40"
            height="40"
            src={imageSrc || graylogo140}
            fallbackSrc={
              isDev && typeof imageSrc === 'string'
                ? imageSrc
                    .replace('dev', 'main')
                    .replace('images-', 'imagesdev-')
                : undefined
            }
            alt=""
            draggable={false}
            loader={imageSrc ? thumborLoader : null}
          />
        </Box>

        <Text fontSize="xl">
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
  );
}
