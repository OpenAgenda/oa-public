'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { defineMessages, useIntl } from 'react-intl';
import ky from 'ky';
import { Button, Field, HStack, chakra } from '@openagenda/uikit';
import {
  NativeSelectField,
  NativeSelectRoot,
} from '@openagenda/uikit/snippets';
import stripLocalePrefix from 'utils/stripLocalePrefix';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import { SETTINGS_LANGUAGES, type SettingsUser } from './types';

const LABEL_ID = 'settings-language-label';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.Language.title',
    defaultMessage: 'Language',
  },
  save: {
    id: 'next.components.settings.Language.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'next.components.settings.Language.success',
    defaultMessage: 'Your profile has been updated successfully.',
  },
  error: {
    id: 'next.components.settings.Language.error',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

interface LanguageSectionProps {
  user: SettingsUser;
  onUpdated: () => void;
}

export default function LanguageSection({
  user,
  onUpdated,
}: LanguageSectionProps) {
  const intl = useIntl();
  const pathname = usePathname();
  const [culture, setCulture] = useState(user.culture ?? 'fr');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Re-sync the select when the stored culture changes (fires only on an actual
  // prop change, so it doesn't clobber an unsaved selection).
  useEffect(() => {
    setCulture(user.culture ?? 'fr');
  }, [user.culture]);

  const currentLabel =
    SETTINGS_LANGUAGES.find((l) => l.code === user.culture)?.label ??
    user.culture;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(false);
    try {
      await ky.patch('/users/me', { json: { culture } });
      onUpdated();
      // The page locale is driven by the /[locale] URL segment, not the saved
      // culture, so saving alone leaves the UI in the previous language. Reload
      // the same settings path under the new locale prefix (mirrors the navbar
      // LanguageSelector) — a hard navigation re-runs the server render so the
      // chosen language's messages load. Keep `saving` true through the unload.
      if (culture !== user.culture) {
        window.location.assign(`/${culture}${stripLocalePrefix(pathname)}`);
        return;
      }
      setSuccess(true);
      setSaving(false);
    } catch {
      setError(true);
      setSaving(false);
    }
  };

  return (
    <AccordionItem
      value="language"
      labelId={LABEL_ID}
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        currentLabel ? (
          <chakra.span color="fg.muted">{currentLabel}</chakra.span>
        ) : undefined
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="xl">
        {/* No Field.Label: the open accordion's visible trigger label sits
            directly above this control, referenced via aria-labelledby to
            avoid a duplicate label (RGAA 11.1). */}
        <HStack align="center" gap="3" mb="4">
          <Field.Root disabled={saving} flex="1">
            <NativeSelectRoot>
              <NativeSelectField
                id="settings-language"
                name="culture"
                aria-labelledby={LABEL_ID}
                value={culture}
                items={SETTINGS_LANGUAGES.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setCulture(e.target.value);
                  setSuccess(false);
                }}
              />
            </NativeSelectRoot>
          </Field.Root>
          {/* h=10 to match the md select height (Button md defaults to h=9) */}
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
