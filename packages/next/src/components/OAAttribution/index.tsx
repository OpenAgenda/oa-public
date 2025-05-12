import { Box, Link } from '@openagenda/uikit';
import Image from 'components/Image';
import logoPic from '../../../public/images/oa.svg';

export default function OAAttribution({ source }: { source: string }) {
  return (
    <Box fontSize="sm" display="flex" justifyContent="flex-end" mt="2">
      <Link
        href={`https://openagenda.com/?mtm_source=${source}&mtm_medium=embed&mtm_campaign=logo`}
        target="_blank"
        display="flex"
        bg="white"
        p="2"
        zIndex="sticky"
      >
        <Box asChild h="18" w="auto" display="inline">
          <Image src={logoPic} alt="OpenAgenda" />
        </Box>
      </Link>
    </Box>
  );
}
