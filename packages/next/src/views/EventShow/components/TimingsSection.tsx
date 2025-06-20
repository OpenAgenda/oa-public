import { Box } from '@openagenda/uikit';
import defaultSize from 'utils/defaultSize';
import Timings from './Timings';

export default function TimingsSection({ event }) {
  return (
    <Box ml={{ base: 0, lg: 12 }} fontSize={defaultSize}>
      <Timings timings={event.timings} timezone={event.timezone} />
    </Box>
  );
}
