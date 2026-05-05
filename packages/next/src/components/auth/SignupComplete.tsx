'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.SignupComplete.heading',
    defaultMessage: 'Check your inbox for a validation link',
  },
  instruction: {
    id: 'next.components.auth.SignupComplete.instruction',
    defaultMessage:
      'An email containing your account activation link is being sent to the address shown below. Check your inbox to complete your registration.',
  },
  didNotReceiveHeading: {
    id: 'next.components.auth.SignupComplete.didNotReceiveHeading',
    defaultMessage: "Didn't receive any mail?",
  },
  step1: {
    id: 'next.components.auth.SignupComplete.step1',
    defaultMessage: 'Double-check the spelling of the email address above.',
  },
  step2: {
    id: 'next.components.auth.SignupComplete.step2',
    defaultMessage:
      'Check your spam folder or other similar folders (filtering tools like "Mailinblack").',
  },
  step3: {
    id: 'next.components.auth.SignupComplete.step3',
    defaultMessage: 'Resend the activation email',
  },
  step4Prefix: {
    id: 'next.components.auth.SignupComplete.step4Prefix',
    defaultMessage: 'Write to us at ',
  },
  resending: {
    id: 'next.components.auth.SignupComplete.resending',
    defaultMessage: 'Resending…',
  },
  resent: {
    id: 'next.components.auth.SignupComplete.resent',
    defaultMessage: 'The activation email has been resent.',
  },
  resendFailed: {
    id: 'next.components.auth.SignupComplete.resendFailed',
    defaultMessage: 'Could not resend the email. Please try again.',
  },
  cooldownMessage: {
    id: 'next.components.auth.SignupComplete.cooldownMessage',
    defaultMessage:
      'You can resend in {seconds, plural, one {# second} other {# seconds}}.',
  },
});

const SUPPORT_EMAIL = 'verif@openagenda.com';
const RESEND_COOLDOWN_MS = 30_000;

interface SignupCompleteProps {
  email: string;
  resendUrl: string;
}

type ResendResult = 'idle' | 'sent' | 'error';

export default function SignupComplete({
  email,
  resendUrl,
}: SignupCompleteProps) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResendResult>('idle');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [],
  );

  const handleResend = useCallback(async () => {
    setLoading(true);
    setResult('idle');
    try {
      const res = await fetch(resendUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        setResult('sent');
        setCooldownRemaining(RESEND_COOLDOWN_MS / 1000);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        intervalRef.current = setInterval(() => {
          setCooldownRemaining((prev) => {
            if (prev <= 1) {
              if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResult('error');
      }
    } catch {
      setResult('error');
    } finally {
      setLoading(false);
    }
  }, [resendUrl]);

  const isDisabled = loading || cooldownRemaining > 0;

  return (
    <VStack align="stretch" gap="4" py="2">
      <Heading as="h2" size="lg">
        {intl.formatMessage(messages.heading)}
      </Heading>
      <Text>{intl.formatMessage(messages.instruction)}</Text>
      <Text textAlign="center" fontWeight="bold">
        {email}
      </Text>
      <Heading as="h3" size="md">
        {intl.formatMessage(messages.didNotReceiveHeading)}
      </Heading>
      <Text as="ol" pl="6" m="0" listStyleType="decimal">
        <Text as="li">{intl.formatMessage(messages.step1)}</Text>
        <Text as="li">{intl.formatMessage(messages.step2)}</Text>
        <Text as="li">
          <Button
            variant="link"
            type="button"
            color="primary.500"
            onClick={handleResend}
            disabled={isDisabled}
            aria-busy={loading || undefined}
          >
            {loading ? (
              <>
                <Spinner size="xs" mr="2" />
                {intl.formatMessage(messages.resending)}
              </>
            ) : 
              intl.formatMessage(messages.step3)
            }
          </Button>
          {result === 'sent' && (
            <chakra.span
              role="status"
              display="block"
              color="fg.muted"
              mt="1"
              fontSize="sm"
            >
              {intl.formatMessage(messages.resent)}
            </chakra.span>
          )}
          {cooldownRemaining > 0 && (
            <chakra.span display="block" color="fg.muted" mt="1" fontSize="sm">
              {intl.formatMessage(messages.cooldownMessage, {
                seconds: cooldownRemaining,
              })}
            </chakra.span>
          )}
          {result === 'error' && (
            <chakra.span
              role="status"
              display="block"
              color="red.600"
              mt="1"
              fontSize="sm"
            >
              {intl.formatMessage(messages.resendFailed)}
            </chakra.span>
          )}
        </Text>
        <Text as="li">
          {intl.formatMessage(messages.step4Prefix)}
          <Link href={`mailto:${SUPPORT_EMAIL}`} color="primary.500">
            {SUPPORT_EMAIL}
          </Link>
        </Text>
      </Text>
    </VStack>
  );
}
