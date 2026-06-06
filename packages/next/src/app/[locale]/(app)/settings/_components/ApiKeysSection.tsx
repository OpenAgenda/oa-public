'use client';

import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ky from 'ky';
import {
  Button,
  Field,
  IconButton,
  Input,
  Link,
  Spinner,
  Text,
  VStack,
  HStack,
  chakra,
} from '@openagenda/uikit';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

const DOC_URL = 'https://developers.openagenda.com';

interface ApiKey {
  id: string;
  name?: string;
  start?: string;
  metadata?: { oaKind?: 'pk' | 'sk'; source?: string };
}

const messages = defineMessages({
  title: {
    id: 'next.components.settings.ApiKeys.title',
    defaultMessage: 'API keys',
  },
  summary: {
    id: 'next.components.settings.ApiKeys.summary',
    defaultMessage: 'Show api keys',
  },
  info: {
    id: 'next.components.settings.ApiKeys.info',
    defaultMessage:
      "API key for reading and writing data via OpenAgenda's API.",
  },
  documentation: {
    id: 'next.components.settings.ApiKeys.documentation',
    defaultMessage: 'Show documentation',
  },
  tiersHelp: {
    id: 'next.components.settings.ApiKeys.tiersHelp',
    defaultMessage:
      'A public key (pk) is read-only and safe to embed client-side; a secret key (sk) can also write and must stay private.',
  },
  publicKey: {
    id: 'next.components.settings.ApiKeys.publicKey',
    defaultMessage: 'Public key',
  },
  secretKey: {
    id: 'next.components.settings.ApiKeys.secretKey',
    defaultMessage: 'Secret key',
  },
  keyName: {
    id: 'next.components.settings.ApiKeys.keyName',
    defaultMessage: 'Key name',
  },
  shownOnce: {
    id: 'next.components.settings.ApiKeys.shownOnce',
    defaultMessage: "Copy this key now: it won't be shown again.",
  },
  reveal: {
    id: 'next.components.settings.ApiKeys.reveal',
    defaultMessage: 'Reveal key',
  },
  hide: {
    id: 'next.components.settings.ApiKeys.hide',
    defaultMessage: 'Hide key',
  },
  copy: { id: 'next.components.settings.ApiKeys.copy', defaultMessage: 'Copy' },
  copied: {
    id: 'next.components.settings.ApiKeys.copied',
    defaultMessage: 'Copied',
  },
  rename: {
    id: 'next.components.settings.ApiKeys.rename',
    defaultMessage: 'Rename',
  },
  name: {
    id: 'next.components.settings.ApiKeys.name',
    defaultMessage: 'Add a name',
  },
  save: { id: 'next.components.settings.ApiKeys.save', defaultMessage: 'Save' },
  cancel: {
    id: 'next.components.settings.ApiKeys.cancel',
    defaultMessage: 'Cancel',
  },
  remove: {
    id: 'next.components.settings.ApiKeys.remove',
    defaultMessage: 'Remove',
  },
  removeKey: {
    id: 'next.components.settings.ApiKeys.removeKey',
    defaultMessage: 'Remove key',
  },
  removeKeyWarning: {
    id: 'next.components.settings.ApiKeys.removeKeyWarning',
    defaultMessage: 'Are you sure you want to delete this key?',
  },
  generatePublicKey: {
    id: 'next.components.settings.ApiKeys.generatePublicKey',
    defaultMessage: 'Generate a public key',
  },
  generateSecretKey: {
    id: 'next.components.settings.ApiKeys.generateSecretKey',
    defaultMessage: 'Generate a secret key',
  },
  error: {
    id: 'next.components.settings.ApiKeys.error',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

const isLegacyKey = (item: ApiKey) => item.metadata?.source === 'mirror';

// Native keys: `start` is only the leading 12 chars, so it's a safe partial
// hint to show permanently once the one-time plaintext is gone.
const maskedHint = (item: ApiKey) =>
  item.start ? `${item.start}••••••••` : '••••••••••••';

// Legacy mirror keys keep their FULL value in `start`, so it must never be
// surfaced wholesale: when hidden, show a short prefix plus a fixed mask.
const obscureValue = (value: string) => `${value.slice(0, 4)}••••••••••••`;

interface KeyRowProps {
  item: ApiKey;
  revealed?: string;
  onRename: (id: string, name: string) => Promise<void>;
  onRemove: (item: ApiKey) => void;
}

function KeyRow({ item, revealed, onRename, onRemove }: KeyRowProps) {
  const intl = useIntl();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Plaintext is present only right after creation (native keys, shown once)
  // or permanently for legacy mirror keys (full value kept in `start`).
  const isLegacy = isLegacyKey(item);
  const fullValue = revealed ?? (isLegacy ? item.start ?? null : null);
  // Legacy keys are hidden behind a reveal toggle; freshly-revealed native
  // keys (shown once) display in full immediately.
  const canToggle = isLegacy && fullValue != null;
  const obscured = canToggle && !showSecret;
  const displayValue =
    fullValue == null
      ? maskedHint(item)
      : obscured
        ? obscureValue(fullValue)
        : fullValue;
  const tier = intl.formatMessage(
    item.metadata?.oaKind === 'pk' ? messages.publicKey : messages.secretKey,
  );

  const save = async () => {
    setSavingName(true);
    try {
      await onRename(item.id, name);
      setEditing(false);
    } finally {
      setSavingName(false);
    }
  };

  const copy = () => {
    if (!fullValue || !navigator.clipboard) return;
    // Only flip to "Copied" once the write actually resolves — in an insecure
    // context (or when the API is unavailable) it would otherwise claim success
    // while nothing reached the clipboard, which is dangerous for a key shown
    // only once.
    navigator.clipboard
      .writeText(fullValue)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <chakra.div
      borderWidth="1px"
      borderColor="border.emphasized"
      borderRadius="l2"
      p="3"
      mb="3"
    >
      <HStack justify="space-between" align="center" mb="1.5" gap="2">
        {editing ? (
          <HStack flex="1" gap="2">
            <Input
              size="sm"
              flex="1"
              value={name}
              placeholder={intl.formatMessage(messages.keyName)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <Button size="sm" loading={savingName} onClick={save}>
              {intl.formatMessage(messages.save)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setName(item.name ?? '');
                setEditing(false);
              }}
            >
              {intl.formatMessage(messages.cancel)}
            </Button>
          </HStack>
        ) : (
          <HStack flex="1" gap="1" align="baseline">
            <Text fontWeight="medium">
              {item.name || intl.formatMessage(messages.keyName)}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              ({tier})
            </Text>
            <Button
              size="sm"
              variant="plain"
              h="auto"
              px="2"
              onClick={() => setEditing(true)}
            >
              {intl.formatMessage(item.name ? messages.rename : messages.name)}
            </Button>
          </HStack>
        )}
      </HStack>

      <HStack gap="2" align="center">
        <Input
          size="sm"
          flex="1"
          readOnly
          disabled={fullValue == null}
          value={displayValue}
          fontFamily="mono"
        />
        {canToggle && (
          <IconButton
            size="sm"
            variant="outline"
            aria-label={intl.formatMessage(
              showSecret ? messages.hide : messages.reveal,
            )}
            onClick={() => setShowSecret((v) => !v)}
          >
            {showSecret ? <LuEyeOff /> : <LuEye />}
          </IconButton>
        )}
        {fullValue && (
          <Button size="sm" variant="outline" onClick={copy}>
            {intl.formatMessage(copied ? messages.copied : messages.copy)}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          colorPalette="red"
          onClick={() => onRemove(item)}
        >
          {intl.formatMessage(messages.remove)}
        </Button>
      </HStack>

      {revealed && (
        <Text color="orange.600" fontSize="sm" mt="1">
          {intl.formatMessage(messages.shownOnce)}
        </Text>
      )}
    </chakra.div>
  );
}

interface ApiKeysSectionProps {
  user: SettingsUser;
}

export default function ApiKeysSection({ user }: ApiKeysSectionProps) {
  const intl = useIntl();
  const [items, setItems] = useState<ApiKey[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [creating, setCreating] = useState<'pk' | 'sk' | null>(null);
  const [actionError, setActionError] = useState(false);
  const [removing, setRemoving] = useState<ApiKey | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ky.get('/users/me/api-keys')
      .json<{ items: ApiKey[] }>()
      .then((data) => {
        if (!cancelled) {
          setItems(data.items ?? []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback(async (oaKind: 'pk' | 'sk') => {
    setCreating(oaKind);
    setActionError(false);
    try {
      const { key, record } = await ky
        .post('/users/me/api-keys', { json: { oaKind } })
        .json<{ key: string; record: ApiKey }>();
      // Newest first, matching the server's createdAt-desc order.
      setItems((prev) => [record, ...prev]);
      setRevealed((prev) => ({ ...prev, [record.id]: key }));
    } catch {
      setActionError(true);
    } finally {
      setCreating(null);
    }
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    setActionError(false);
    try {
      const { record } = await ky
        .patch(`/users/me/api-keys/${id}`, { json: { name } })
        .json<{ record: ApiKey }>();
      setItems((prev) => prev.map((it) => (it.id === id ? record : it)));
    } catch {
      setActionError(true);
    }
  }, []);

  const confirmRemove = useCallback(async () => {
    if (!removing) return;
    const { id } = removing;
    setRemoveBusy(true);
    setActionError(false);
    try {
      await ky.delete(`/users/me/api-keys/${id}`).json();
      setItems((prev) => prev.filter((it) => it.id !== id));
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setRemoving(null);
    } catch {
      setActionError(true);
    } finally {
      setRemoveBusy(false);
    }
  }, [removing]);

  return (
    <AccordionItem
      value="apiKey"
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        <chakra.span color="fg.muted">
          {intl.formatMessage(messages.summary)}
        </chakra.span>
      }
    >
      <chakra.div maxW="2xl">
        <Text mb="2">{intl.formatMessage(messages.info)}</Text>
        <Text mb="2">
          <Link href={DOC_URL} target="_blank" rel="noreferrer">
            {intl.formatMessage(messages.documentation)}
          </Link>
        </Text>
        <Text color="fg.muted" fontSize="sm" mb="4">
          {intl.formatMessage(messages.tiersHelp)}
        </Text>

        {!loaded ? (
          loadError ? (
            <MessageAlert role="alert" status="error">
              {intl.formatMessage(messages.error)}
            </MessageAlert>
          ) : (
            <chakra.div display="flex" justifyContent="center" py="6">
              <Spinner />
            </chakra.div>
          )
        ) : (
          <>
            {/* Buttons sit above the list so a newly-created key (prepended,
                newest-first per the server's createdAt-desc order) appears
                right below them instead of jumping past the whole list. */}
            <HStack gap="3" justify="flex-end" mb="4">
              <Button
                variant="outline"
                loading={creating === 'pk'}
                onClick={() => create('pk')}
              >
                {intl.formatMessage(messages.generatePublicKey)}
              </Button>
              {user.canCreateSecretKeys && (
                <Button
                  variant="outline"
                  loading={creating === 'sk'}
                  onClick={() => create('sk')}
                >
                  {intl.formatMessage(messages.generateSecretKey)}
                </Button>
              )}
            </HStack>

            {actionError && (
              <MessageAlert role="alert" status="error" mb="3">
                {intl.formatMessage(messages.error)}
              </MessageAlert>
            )}

            {items.map((item) => (
              <KeyRow
                key={item.id}
                item={item}
                revealed={revealed[item.id]}
                onRename={rename}
                onRemove={setRemoving}
              />
            ))}
          </>
        )}
      </chakra.div>

      {/* Remove confirmation */}
      <DialogRoot
        open={!!removing}
        onOpenChange={(e: { open: boolean }) => {
          if (!e.open) setRemoving(null);
        }}
        placement="center"
        role="alertdialog"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{intl.formatMessage(messages.removeKey)}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>{intl.formatMessage(messages.removeKeyWarning)}</Text>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button
              colorPalette="red"
              loading={removeBusy}
              onClick={confirmRemove}
            >
              {intl.formatMessage(messages.remove)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </AccordionItem>
  );
}
