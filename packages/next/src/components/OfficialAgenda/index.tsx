import { useIntl, defineMessages } from 'react-intl';
import { Icon, Tooltip, IconProps, TooltipProps } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeCheck } from '@fortawesome/pro-duotone-svg-icons';

const messages = defineMessages({
  officialAgenda: {
    id: 'next.components.OfficialAgenda.officialAgenda',
    defaultMessage: 'Official agenda',
  },
});

export interface OfficialAgendaProps extends IconProps {
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export default function OfficialAgenda({ tooltipProps, ...props }: OfficialAgendaProps) {
  const intl = useIntl();

  return (
    <Tooltip
      label={intl.formatMessage(messages.officialAgenda)}
      placement="right"
      hasArrow
      bg="white"
      color="black"
      borderRadius="base" // TODO in theme
      arrowSize={8}
      arrowPadding={6}
      {...tooltipProps}
    >
      <Icon
        as={FontAwesomeIcon}
        icon={faBadgeCheck}
        {...props}
        __css={{
          '--fa-primary-color': 'white',
          '--fa-secondary-color': 'colors.primary.500',
          '--fa-primary-opacity': '1',
          '--fa-secondary-opacity': '1',
        }}
      />
    </Tooltip>
  );
}
