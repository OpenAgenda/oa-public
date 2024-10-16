import { Box, Link } from '@openagenda/uikit';
import Image from 'components/Image';
import logoPic from '../../../public/images/oa.svg';

export default function OAAttribution() {
  return (
    <Box
      pos="absolute"
      bottom="0"
      right="0"
      fontSize="sm"
      display="flex"
      px="2"
      py="0.5"
      bg="whiteAlpha.800"
      zIndex="sticky"
    >
      <Link href="https://openagenda.com" target="_blank">
        <Image
          src={logoPic}
          alt="OpenAgenda"
          h="18"
          w="auto"
          display="inline"
        />
      </Link>
    </Box>
  );
}
