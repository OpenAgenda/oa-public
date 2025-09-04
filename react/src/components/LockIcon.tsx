import { useIntl, defineMessages } from 'react-intl';
import { createIcon, Icon, IconProps } from '@openagenda/uikit';
import { Tooltip, TooltipProps } from '@openagenda/uikit/snippets';

const messages = defineMessages({
  agenda: {
    id: 'react.components.LockIcon.privateAgenda',
    defaultMessage: 'Private agenda',
  },
});

export interface LockIconProps extends IconProps {
  type?: string;
  label?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'content'>;
}

const LockSvgIcon = createIcon({
  displayName: 'LockIcon',
  viewBox: '0 0 448 512',
  path: (
    <path
      fill="currentColor"
      d="M144 128l0 64 160 0 0-64c0-44.2-35.8-80-80-80s-80 35.8-80 80zM96 192l0-64C96 57.3 153.3 0 224 0s128 57.3 128 128l0 64 32 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l32 0zM48 256l0 192c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-192c0-8.8-7.2-16-16-16L64 240c-8.8 0-16 7.2-16 16z"
    />
  ),
});

export default function LockIcon({
  tooltipProps,
  type,
  label,
  ...props
}: LockIconProps) {
  const intl = useIntl();

  const message = messages[type] ? intl.formatMessage(messages[type]) : label;

  const icon = (
    <Icon
      role="img"
      aria-label={message}
      display="inline-block"
      h="1em"
      verticalAlign="-.125em"
      {...props}
    >
      <LockSvgIcon />
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
