import { useIntl, defineMessages } from 'react-intl';
import { Icon, Tooltip, IconProps, TooltipProps } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/pro-regular-svg-icons';

const messages = defineMessages({
  privateAgenda: {
    id: 'next.components.OfficialAgenda.privateAgenda',
    defaultMessage: 'Private agenda',
  },
});

export interface PrivateAgendaProps extends IconProps {
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export default function PrivateAgenda({ tooltipProps, ...props }: PrivateAgendaProps) {
  const intl = useIntl();

  return (
    <Tooltip
      label={intl.formatMessage(messages.privateAgenda)}
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
        icon={faLock}
        {...props}
      />
    </Tooltip>
  );
}
