import { Icon, Grid } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { FaIcon } from 'icons';
import { faChild } from 'icons/solid';

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
      <Icon
        as={FaIcon}
        icon={ageIcon}
        size="2xl"
        color="oaGray.300"
        justifySelf="end"
      />

      <div>
        {!event.age.max
          ? intl.formatMessage(messages.startingAt, { min: event.age.min })
          : intl.formatMessage(messages.minToMaxYearsOld, {
              min: event.age.min,
              max: event.age.max,
            })}
      </div>
    </Grid>
  );
}
