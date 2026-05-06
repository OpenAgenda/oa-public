'use client';

import { forwardRef, ReactNode, ComponentProps } from 'react';
import { Alert } from '@openagenda/uikit';

type Status = 'info' | 'success' | 'warning' | 'error';

type MessageAlertProps = {
  status: Status;
  children: ReactNode;
  description?: ReactNode;
} & Omit<ComponentProps<typeof Alert.Root>, 'children' | 'status'>;

const MessageAlert = forwardRef<HTMLDivElement, MessageAlertProps>(
  function MessageAlert(
    { status, children, description, ...rest }: MessageAlertProps,
    ref,
  ) {
    return (
      <Alert.Root
        ref={ref}
        status={status}
        bg={`bg.${status}`}
        borderRadius="0"
        {...rest}
      >
        <Alert.Indicator />
        {description ? (
          <Alert.Content>
            <Alert.Title>{children}</Alert.Title>
            <Alert.Description>{description}</Alert.Description>
          </Alert.Content>
        ) : (
          <Alert.Title>{children}</Alert.Title>
        )}
      </Alert.Root>
    );
  },
);

export default MessageAlert;
