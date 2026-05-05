import { chakra, Icon, Grid } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { FaIcon } from '@/src/icons';
import { faChild } from '@/src/icons/solid';
import defaultStyle from '@/src/utils/defaultStyle';

import { sidebar as messages } from '../messages';

export default function AgeSection({ event, ageIcon = faChild, ...props }) {
  const intl = useIntl();

  if (!event.age?.min && !event.age?.max) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="8"
      alignItems="center"
      {...props}
    >
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={ageIcon} />
      </Icon>

      <chakra.div css={defaultStyle}>
        {!event.age.max
          ? intl.formatMessage(messages.startingAt, { min: event.age.min })
          : intl.formatMessage(messages.minToMaxYearsOld, {
              min: event.age.min,
              max: event.age.max,
            })}
      </chakra.div>
    </Grid>
  );
}
