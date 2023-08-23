import { useIntl, defineMessages } from 'react-intl';
import { Icon, Tooltip, IconProps, TooltipProps } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/pro-regular-svg-icons';

const messages = defineMessages({
  agenda: {
    id: 'next.components.LockIcon.privateAgenda',
    defaultMessage: 'Private agenda',
  },
});

export interface LockIconProps extends IconProps {
  type?: string
  label?: string
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export default function LockIcon({ tooltipProps, type, label, ...props }: LockIconProps) {
  const intl = useIntl();

  const message = messages[type] ? intl.formatMessage(messages[type]) : label;

  const icon = (
    <Icon
      as={FontAwesomeIcon}
      icon={faLock}
      {...props}
    />
  );

  if (!message) {
    return icon;
  }

  return (
    <Tooltip
      label={message}
      placement="right"
      hasArrow
      bg="white"
      color="black"
      borderRadius="base" // TODO in theme
      arrowSize={8}
      arrowPadding={6}
      {...tooltipProps}
    >
      {icon}
    </Tooltip>
  );
}
