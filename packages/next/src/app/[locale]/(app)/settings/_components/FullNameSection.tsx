'use client';

import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ky from 'ky';
import { Button, Field, HStack, Input, chakra } from '@openagenda/uikit';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

const LABEL_ID = 'settings-fullName-label';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.FullName.title',
    defaultMessage: 'Username',
  },
  save: {
    id: 'next.components.settings.FullName.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'next.components.settings.FullName.success',
    defaultMessage: 'Your profile has been updated successfully.',
  },
  error: {
    id: 'next.components.settings.FullName.error',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

interface FullNameSectionProps {
  user: SettingsUser;
  onUpdated: () => void;
}

export default function FullNameSection({
  user,
  onUpdated,
}: FullNameSectionProps) {
  const intl = useIntl();
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Re-sync the field when the stored value changes (e.g. after a save the
  // server normalised it, or another tab updated it) — only fires on an actual
  // prop change, so it never clobbers an in-progress edit.
  useEffect(() => {
    setFullName(user.fullName ?? '');
  }, [user.fullName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(false);
    try {
      await ky.patch('/users/me', { json: { fullName } });
      setSuccess(true);
      onUpdated();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccordionItem
      value="fullName"
      labelId={LABEL_ID}
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
          {/* Visible required cue mirroring Field.RequiredIndicator on the
              labelled rows. The input has no Field.Label of its own (it borrows
              this trigger label via aria-labelledby), so the asterisk lives here.
              aria-hidden: the native `required` on the input already conveys the
              state to assistive tech, so the asterisk stays out of the
              accessible name (RGAA 11.10). */}
          <chakra.span aria-hidden="true" color="red.solid" ms="1">
            *
          </chakra.span>
        </chakra.span>
      }
      summary={
        user.fullName ? (
          <chakra.span color="fg.muted">{user.fullName}</chakra.span>
        ) : undefined
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="xl">
        {/* No Field.Label: the open accordion's visible trigger label sits
            directly above this field, so the input borrows it via
            aria-labelledby instead of repeating it (RGAA 11.1). */}
        <HStack align="center" gap="3" mb="4">
          <Field.Root required disabled={saving} flex="1">
            <Input
              id="settings-fullName"
              name="fullName"
              aria-labelledby={LABEL_ID}
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFullName(e.target.value);
                setSuccess(false);
              }}
            />
          </Field.Root>
          {/* h=10 to match the md Input height (Button md defaults to h=9) */}
          <Button type="submit" colorPalette="blue" h="10" loading={saving}>
            {intl.formatMessage(messages.save)}
          </Button>
        </HStack>

        {success && (
          <MessageAlert role="status" status="success" mb="4">
            {intl.formatMessage(messages.success)}
          </MessageAlert>
        )}
        {error && (
          <MessageAlert role="alert" status="error" mb="4">
            {intl.formatMessage(messages.error)}
          </MessageAlert>
        )}
      </chakra.form>
    </AccordionItem>
  );
}
