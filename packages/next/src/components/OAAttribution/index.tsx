import { Box, Link } from '@openagenda/uikit';
import Image from 'components/Image';
import logoPic from '../../../public/images/oa.svg';

export default function OAAttribution() {
  return (
    <Box fontSize="sm" display="flex" justifyContent="flex-end" mt="2">
      <Link
        href="https://openagenda.com"
        target="_blank"
        display="flex"
        bg="white"
        p="2"
        zIndex="sticky"
      >
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
