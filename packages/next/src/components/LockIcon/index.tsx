import { useIntl, defineMessages } from 'react-intl';
import { Icon, IconProps } from '@openagenda/uikit';
import { Tooltip, TooltipProps } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/pro-regular-svg-icons';

const messages = defineMessages({
  agenda: {
    id: 'next.components.LockIcon.privateAgenda',
    defaultMessage: 'Private agenda',
  },
});

export interface LockIconProps extends IconProps {
  type?: string;
  label?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'content'>;
}

export default function LockIcon({
  tooltipProps,
  type,
  label,
  ...props
}: LockIconProps) {
  const intl = useIntl();

  const message = messages[type] ? intl.formatMessage(messages[type]) : label;

  const icon = (
    <Icon {...props}>
      <FontAwesomeIcon icon={faLock} />
    </Icon>
  );

  if (!message) {
    return icon;
  }

  return (
    <Tooltip
      content={message}
      positioning={{ placement: 'right' }}
      showArrow
      contentProps={{
        css: { '--tooltip-bg': 'white' },
        color: 'black',
      }}
      openDelay={0}
      closeDelay={0}
      {...tooltipProps}
      // arrowSize={8}
      // arrowPadding={6}
    >
      {icon}
    </Tooltip>
  );
}
