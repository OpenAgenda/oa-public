'use client';

import type { Ref } from 'react';
import MTCaptchaWidget from './MTCaptchaWidget';
import MockCaptchaWidget from './MockCaptchaWidget';

export type CaptchaProvider = 'mtcaptcha' | 'mock';

export interface CaptchaWidgetProps {
  provider?: CaptchaProvider;
  siteKey?: string;
  lang?: string;
  onToken: (token: string | null) => void;
  onExpire?: () => void;
  containerRef?: Ref<HTMLDivElement>;
  errorId?: string;
  invalid?: boolean;
}

export default function CaptchaWidget({
  provider = 'mtcaptcha',
  siteKey,
  lang,
  onToken,
  onExpire,
  containerRef,
  errorId,
  invalid,
}: CaptchaWidgetProps) {
  if (provider === 'mock') {
    return (
      <MockCaptchaWidget
        onToken={onToken}
        containerRef={containerRef}
        errorId={errorId}
        invalid={invalid}
      />
    );
  }
  if (!siteKey) {
    return null;
  }
  return (
    <MTCaptchaWidget
      siteKey={siteKey}
      lang={lang}
      onToken={onToken}
      onExpire={onExpire}
      containerRef={containerRef}
      errorId={errorId}
      invalid={invalid}
    />
  );
}
