'use client';

import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ky from 'ky';
import { Button, HStack, chakra } from '@openagenda/uikit';
import { Avatar, FileInput, FileUploadRoot } from '@openagenda/uikit/snippets';
import { thumborLoader } from 'utils/imageLoader';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

// Matches the legacy ImageSettings cap (packages/user-apps).
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

// `user.image` is a bare S3 key; build a CDN URL the same way the Navbar does.
const S3_BUCKET =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_S3_BUCKET
    : process.env.NEXT_PUBLIC_S3_BUCKET;

function imageUrl(key: string): string {
  return thumborLoader({ src: `${S3_BUCKET}/${key}`, width: 200 });
}

const messages = defineMessages({
  title: {
    id: 'next.components.settings.Image.title',
    defaultMessage: 'Profile image',
  },
  modify: {
    id: 'next.components.settings.Image.modify',
    defaultMessage: 'Modify',
  },
  choose: {
    id: 'next.components.settings.Image.choose',
    defaultMessage: 'Choose an image',
  },
  save: {
    id: 'next.components.settings.Image.save',
    defaultMessage: 'Save',
  },
  remove: {
    id: 'next.components.settings.Image.remove',
    defaultMessage: 'Remove the image',
  },
  success: {
    id: 'next.components.settings.Image.success',
    defaultMessage: 'Your profile has been updated successfully.',
  },
  error: {
    id: 'next.components.settings.Image.error',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

interface ImageSectionProps {
  user: SettingsUser;
  onUpdated: () => void;
}

export default function ImageSection({ user, onUpdated }: ImageSectionProps) {
  const intl = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Object URL for the locally-picked file; revoked on change/unmount.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Local preview wins; otherwise show the stored image (if any).
  const avatarSrc =
    previewUrl ?? (user.image ? imageUrl(user.image) : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setSuccess(false);
    setError(false);
    try {
      // Mixed multipart (see @openagenda/utils toMixedMultipart): the `data`
      // JSON field carries non-file values and the file rides under its field
      // name. The cibul-node PATCH /users/me pipeline (mixedMultipartMw +
      // profileImage hook) uploads it to S3.
      const formData = new FormData();
      formData.append('data', JSON.stringify({}));
      formData.append('image', file);
      await ky.patch('/users/me', { body: formData });
      setSuccess(true);
      setFile(null);
      onUpdated();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setSuccess(false);
    setError(false);
    try {
      // `image: null` (carried in the `data` field) tells the profileImage
      // hook to delete the stored file. An empty string would be ignored.
      const formData = new FormData();
      formData.append('data', JSON.stringify({ image: null }));
      await ky.patch('/users/me', { body: formData });
      setSuccess(true);
      setFile(null);
      onUpdated();
    } catch {
      setError(true);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AccordionItem
      value="image"
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        <chakra.span color="fg.muted">
          {intl.formatMessage(messages.modify)}
        </chakra.span>
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="xl">
        <HStack gap="4" mb="4" align="center">
          <Avatar size="lg" src={avatarSrc} name={user.fullName} />
          <FileUploadRoot
            accept="image/*"
            maxFiles={1}
            maxFileSize={MAX_SIZE}
            onFileChange={(details) => {
              setFile(details.acceptedFiles[0] ?? null);
              setSuccess(false);
            }}
            flex="1"
          >
            <FileInput placeholder={intl.formatMessage(messages.choose)} />
          </FileUploadRoot>
          <Button
            type="submit"
            colorPalette="blue"
            h="10"
            loading={saving}
            disabled={!file}
          >
            {intl.formatMessage(messages.save)}
          </Button>
        </HStack>

        {user.image && !file && (
          <Button
            type="button"
            variant="plain"
            // Match the destructive red used by the "Supprimer mon compte"
            // label; the plain variant would otherwise use the darker red.fg.
            color="red.solid"
            size="sm"
            px="0"
            mb="4"
            loading={removing}
            onClick={handleRemove}
          >
            {intl.formatMessage(messages.remove)}
          </Button>
        )}

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
