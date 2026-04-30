'use client';

import { useEffect, useId, useRef, type Ref } from 'react';
import Script from 'next/script';
import { Flex } from '@openagenda/uikit';

interface MTCaptchaConfig {
  sitekey: string;
  renderQueue: string[];
  lang?: string;
  'verified-callback'?: (state: { verifiedToken: string }) => void;
  'verifyexpired-callback'?: () => void;
}

declare global {
  interface Window {
    mtcaptchaConfig?: MTCaptchaConfig;
  }
}

interface MTCaptchaWidgetProps {
  siteKey: string;
  lang?: string;
  onToken: (token: string | null) => void;
  onExpire?: () => void;
  containerRef?: Ref<HTMLDivElement>;
  errorId?: string;
  invalid?: boolean;
}

export default function MTCaptchaWidget({
  siteKey,
  lang,
  onToken,
  onExpire,
  containerRef,
  errorId,
  invalid,
}: MTCaptchaWidgetProps) {
  const reactId = useId().replace(/[:]/g, '');
  const containerId = `mtcaptcha-${reactId}`;
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

  useEffect(() => {
    window.mtcaptchaConfig = {
      sitekey: siteKey,
      renderQueue: [containerId],
      lang,
      'verified-callback': (state) => {
        onTokenRef.current(state?.verifiedToken ?? null);
      },
      'verifyexpired-callback': () => {
        onTokenRef.current(null);
        onExpireRef.current?.();
      },
    };
  }, [siteKey, lang, containerId]);

  return (
    <>
      <Flex justify="center" w="full">
        <div
          id={containerId}
          ref={containerRef}
          tabIndex={invalid ? -1 : undefined}
          aria-describedby={errorId}
          aria-invalid={invalid || undefined}
        />
      </Flex>
      <Script
        id="mtcaptcha-primary"
        src="https://service.mtcaptcha.com/mtcv1/client/mtcaptcha.min.js"
        strategy="lazyOnload"
      />
      <Script
        id="mtcaptcha-secondary"
        src="https://service2.mtcaptcha.com/mtcv1/client/mtcaptcha2.min.js"
        strategy="lazyOnload"
      />
    </>
  );
}
