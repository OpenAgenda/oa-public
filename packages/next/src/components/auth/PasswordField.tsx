'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Field, Input, Spinner, chakra } from '@openagenda/uikit';

const messages = defineMessages({
  required: {
    id: 'next.components.auth.PasswordField.required',
    defaultMessage: 'A password must be defined',
  },
  tooWeak: {
    id: 'next.components.auth.PasswordField.tooWeak',
    defaultMessage: 'This password is too weak 😑',
  },
  weak: {
    id: 'next.components.auth.PasswordField.weak',
    defaultMessage: 'Not very secure 😐',
  },
  weakish: {
    id: 'next.components.auth.PasswordField.weakish',
    defaultMessage: 'A bit better 😬',
  },
  good: {
    id: 'next.components.auth.PasswordField.good',
    defaultMessage: 'Ok 🙂',
  },
  great: {
    id: 'next.components.auth.PasswordField.great',
    defaultMessage: 'Great 🥳',
  },
  usual: {
    id: 'next.components.auth.PasswordField.usual',
    defaultMessage: 'Too usual 🤖',
  },
  isSameAs: {
    id: 'next.components.auth.PasswordField.isSameAs',
    defaultMessage: 'Must be different from name or email 🙄',
  },
});

type StrengthCode = keyof typeof messages;
type StrengthType = 'error' | 'warning' | 'ok';

interface Evaluation {
  type: StrengthType;
  code: StrengthCode;
}

const COLOR_BY_TYPE: Record<StrengthType, string> = {
  error: 'red.500',
  warning: 'orange.500',
  ok: 'green.600',
};

const DEBOUNCE_MS = 1000;

interface PasswordFieldProps {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  identifiers?: { fullName: string; email: string };
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  errorText?: string;
  autoComplete?: string;
  inputRef?: Ref<HTMLInputElement>;
}

export default function PasswordField({
  id,
  name,
  value,
  onChange,
  label,
  identifiers,
  required = false,
  invalid = false,
  disabled = false,
  errorText,
  autoComplete = 'new-password',
  inputRef,
}: PasswordFieldProps) {
  const intl = useIntl();
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const identifiersRef = useRef(identifiers);
  identifiersRef.current = identifiers;

  useEffect(() => {
    if (value === debouncedValue) return undefined;
    const timerId = setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS);
    return () => clearTimeout(timerId);
  }, [value, debouncedValue]);

  useEffect(() => {
    if (!identifiersRef.current) {
      setEvaluation(null);
      return undefined;
    }
    if (!debouncedValue) {
      setEvaluation(null);
      setLoading(false);
      return undefined;
    }
    const ac = new AbortController();
    setLoading(true);
    fetch('/api/password/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: debouncedValue,
        identifiers: {
          full_name: identifiersRef.current.fullName,
          email: identifiersRef.current.email,
        },
      }),
      signal: ac.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.message) {
          setEvaluation(data.message as Evaluation);
        }
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setEvaluation(null);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, [debouncedValue]);

  const showStrength = !!identifiers;
  const strengthMessage =
    evaluation && messages[evaluation.code]
      ? intl.formatMessage(messages[evaluation.code])
      : null;
  const strengthColor = evaluation ? COLOR_BY_TYPE[evaluation.type] : undefined;

  return (
    <Field.Root
      required={required}
      invalid={invalid}
      disabled={disabled}
      mb="4"
    >
      <Field.Label>
        {label}
        {required && <Field.RequiredIndicator />}
      </Field.Label>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
      />
      {errorText ? (
        <Field.ErrorText fontSize="sm">{errorText}</Field.ErrorText>
      ) : showStrength && (strengthMessage || loading) ? (
        <Field.HelperText color={strengthColor} fontSize="sm">
          {strengthMessage}
          {loading && (
            <chakra.span ml="2" verticalAlign="middle">
              <Spinner size="xs" />
            </chakra.span>
          )}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
}
