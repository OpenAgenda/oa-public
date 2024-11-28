import { Box, Link } from '@openagenda/uikit';
import Image from 'components/Image';
import logoPic from '../../../public/images/oa.svg';

export default function OAAttribution() {
  return (
    <Box
      fontSize="sm"
      display="flex"
      justifyContent="flex-end"
      px="2"
      py="0.5"
      bg="whiteAlpha.800"
      zIndex="sticky"
    >
      <Link href="https://openagenda.com" target="_blank" display="flex">
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
