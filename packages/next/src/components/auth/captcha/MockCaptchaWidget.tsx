'use client';

import { useEffect, type Ref } from 'react';
import { Box } from '@openagenda/uikit';

interface MockCaptchaWidgetProps {
  onToken: (token: string | null) => void;
  delay?: number;
  token?: string;
  containerRef?: Ref<HTMLDivElement>;
  errorId?: string;
  invalid?: boolean;
}

export default function MockCaptchaWidget({
  onToken,
  delay = 0,
  token = 'mock-mtcaptcha-token',
  containerRef,
  errorId,
  invalid,
}: MockCaptchaWidgetProps) {
  useEffect(() => {
    if (delay <= 0) {
      onToken(token);
      return undefined;
    }
    const id = setTimeout(() => onToken(token), delay);
    return () => clearTimeout(id);
  }, [onToken, delay, token]);

  return (
    <Box
      ref={containerRef}
      tabIndex={invalid ? -1 : undefined}
      aria-describedby={errorId}
      aria-invalid={invalid || undefined}
      data-testid="captcha-mock"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="md"
      bg="bg.muted"
      px="3"
      py="2"
      fontSize="sm"
      color="fg.muted"
    >
      captcha (mock)
    </Box>
  );
}
