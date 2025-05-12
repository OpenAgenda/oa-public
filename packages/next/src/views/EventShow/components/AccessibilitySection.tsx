import { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { chakra, Grid, Icon, Box } from '@openagenda/uikit';
import messages from '@openagenda/common-labels/event/accessibilities';
import { FaIcon } from 'icons';
import { faWheelchair } from 'icons/solid';
import defaultStyle from 'utils/defaultStyle';
import { faEarDeaf, faEyeLowVision } from 'icons/regular';
import { faPI, faII } from 'icons/custom';

function defaultGetAccessibilityIcon(type: string) {
  switch (type) {
    case 'ii': // accessibleToIntellectually
      return faII;
    case 'hi': // accessibleToHearing
      return faEarDeaf;
    case 'vi': // accessibleToVisually
      return faEyeLowVision;
    case 'pi': // accessibleToPsychic
      return faPI;
    case 'mi': // accessibleToMotor
      return faWheelchair;
    default:
      return null;
  }
}

export default function AccessibilitySection({
  event,
  getAccessibilityIcon = defaultGetAccessibilityIcon,
  ...props
}) {
  const intl = useIntl();

  const accessibilities = Object.entries(event.accessibility);

  const hasAccessibility = accessibilities.some((v) => v[1] === true);

  if (!hasAccessibility) {
    return null;
  }

  return (
    <Grid
      templateColumns="2em 1fr"
      columnGap="4"
      rowGap="4"
      alignItems="center"
      {...props}
    >
      {' '}
      <Icon color="oaGray.300" justifySelf="center" fontSize="3xl">
        <FaIcon icon={getAccessibilityIcon('mi')} />
      </Icon>
      <Box
        color="oaGray.500"
        title={intl.formatMessage(messages.accessibleDetail)}
      >
        <b>{intl.formatMessage(messages.accessibleEvent)}</b>
      </Box>
      {accessibilities.map(([accessibilityKey, accessibilityValue]) => {
        if (!accessibilityValue) {
          return null;
        }

        return (
          <Fragment key={accessibilityKey}>
            <Icon color="oaGray.300" justifySelf="end">
              <FaIcon icon={getAccessibilityIcon(accessibilityKey)} size="lg" />
            </Icon>
            <chakra.div css={defaultStyle}>
              {intl.formatMessage(messages[accessibilityKey])}
            </chakra.div>
          </Fragment>
        );
      })}
    </Grid>
  );
}
