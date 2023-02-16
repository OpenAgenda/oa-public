import { useRouter } from 'next/router';
import qs from 'qs';
import { HStack, NoBreak, Text } from '@openagenda/uikit';
import NextChakraLink from 'components/NextChakraLink';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import PrivateAgenda from 'components/PrivateAgenda';

function simpleLoader({ src }) {
  return src;
}

export default function AgendaItem({ agenda, targetAgenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const router = useRouter();

  const url = new URL(router.asPath, 'http://n');
  // const redirectUrlPart = Buffer.from(url.pathname).toString('base64');

  return (
    <NextChakraLink
      href={`${targetAgenda.slug}/admin/sources?${qs.stringify({
        source: agenda.slug,
        redirect: url.pathname,
      })}`}
      locale={false}
    >
      <HStack>
        <Image
          rounded="full"
          width="40"
          height="40"
          src={targetAgenda.image}
          fallbackSrc={isDev ? targetAgenda.image.replace('cibuldev', 'cibul') : null}
          fallbackStrategy="onError"
          alt=""
          draggable={false}
          loader={simpleLoader}
          border="3px solid white"
          h="40px"
          fit="cover"
        />

        <Text fontSize="xl">
          {targetAgenda.title}
          {targetAgenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                tooltipProps={{
                  bg: 'black',
                  color: 'white',
                }}
              />
            </NoBreak>
          ) : null}
          {targetAgenda.private ? (
            <NoBreak>
              <PrivateAgenda
                ml="2"
                tooltipProps={{
                  bg: 'black',
                  color: 'white',
                }}
              />
            </NoBreak>
          ) : null}
        </Text>
      </HStack>
    </NextChakraLink>
  );
}
