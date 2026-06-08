'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import ky from 'ky';
import Fuse from 'fuse.js';
import {
  Button,
  Field,
  Input,
  Spinner,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';
import { AccordionRoot, Checkbox } from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

// Show the per-agenda filter once there are at least this many child entities
// (mirrors the legacy MINLEN_REQUIRED_FOR_SEARCH).
const SEARCH_THRESHOLD = 8;

interface Rule {
  key: string;
  tag: string; // 'user' | 'contributor' | 'adminmod'
  actions: string;
  subject: string;
  conditions?: Record<string, unknown> | null;
  inverted?: boolean;
  entityName: string;
  identifier: number | string;
  entity?: {
    fullName?: string;
    title?: string;
    agendaTitle?: string;
  };
}

// IDs reuse the @openagenda/abilities message set so the existing translations
// can be carried over verbatim.
const messages = defineMessages({
  title: {
    id: 'next.components.settings.Notifications.title',
    defaultMessage: 'Notifications',
  },
  modify: {
    id: 'next.components.settings.Notifications.modify',
    defaultMessage: 'Modify',
  },
  save: {
    id: 'Abilities.AbilitiesForm.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'next.components.settings.Notifications.success',
    defaultMessage: 'Your notification preferences have been saved.',
  },
  loadError: {
    id: 'Abilities.AbilitiesEditor.error',
    defaultMessage: 'Error.',
  },
  saveError: {
    id: 'next.components.settings.Notifications.saveError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
  search: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.search',
    defaultMessage: 'Search',
  },
  filterPlaceholder: {
    id: 'next.components.settings.Notifications.filterPlaceholder',
    defaultMessage: 'Search an agenda',
  },
  // Group headers
  firstEntityUser: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityUser',
    defaultMessage: 'Your global settings:',
  },
  firstEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityContributor',
    defaultMessage: 'Your contributor settings:',
  },
  firstEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityAdminmod',
    defaultMessage: 'Your administrator or moderator settings:',
  },
  childEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityContributor',
    defaultMessage: 'Contributor settings:',
  },
  childEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityAdminmod',
    defaultMessage: 'Administrator or moderator settings:',
  },
  // Newsletter
  newsletterTitle: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterTitle',
    defaultMessage: 'Receive the newsletter',
  },
  newsletterDescription: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterDescription',
    defaultMessage:
      'Follow the upcoming evolutions coming up on OpenAgenda! You can unsubscribe at any time.',
  },
  newsletterSubscribe: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterSubscribe',
    defaultMessage: 'Click here to subscribe',
  },
  newsletterSubscribed: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterSubscribed',
    defaultMessage:
      'You will now receive the next newsletter! To unsubscribe, just click on the link that will be placed at the bottom of each message.',
  },
  // State names (for receiveEventChangeState)
  stateRefused: {
    id: 'Abilities.RulesCheckbox.states.refused',
    defaultMessage: 'refused',
  },
  stateToControl: {
    id: 'Abilities.RulesCheckbox.states.toControl',
    defaultMessage: 'to control',
  },
  stateControlled: {
    id: 'Abilities.RulesCheckbox.states.controlled',
    defaultMessage: 'controlled',
  },
  statePublished: {
    id: 'Abilities.RulesCheckbox.states.published',
    defaultMessage: 'published',
  },
});

// Rule labels keyed by `${actions}${UpperFirst(subject)}`.
const ruleMessages = defineMessages({
  receiveInvitation: {
    id: 'Abilities.RulesCheckbox.rules.receiveInvitation',
    defaultMessage: 'Receive invitations',
  },
  receiveNotificationsSummary: {
    id: 'Abilities.RulesCheckbox.rules.receiveNotificationsSummary',
    defaultMessage: 'Receive summaries of notifications',
  },
  receiveMemberMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveMemberMessage',
    defaultMessage: 'Receive messages sent via the "Write to them" feature',
  },
  receiveUserInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveUserInboxMessage',
    defaultMessage: 'Receive messages from my inbox',
  },
  receiveAgendaInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveAgendaInboxMessage',
    defaultMessage: 'Receive messages from agenda inbox',
  },
  receiveEvent: {
    id: 'Abilities.RulesCheckbox.rules.receiveEvent',
    defaultMessage: 'Receive events sent by other users',
  },
  receiveBehavioralEmails: {
    id: 'Abilities.RulesCheckbox.rules.receiveBehavioralEmails',
    defaultMessage: 'Receive behavioral emails',
  },
  receiveMyEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventChangeState',
    defaultMessage:
      'Receive notifications when someone change state of my events',
  },
  receiveMyEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventUpdate',
    defaultMessage: 'Receive notifications when someone update my events',
  },
  receiveMyEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAggregation',
    defaultMessage: 'Receive notifications when someone aggregate my events',
  },
  receiveEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventChangeState',
    defaultMessage: 'Receive states changes for {state}',
  },
  receiveMyEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventCreation',
    defaultMessage: 'Receive event creation confirmations',
  },
  receiveEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventCreation',
    defaultMessage: 'Receive event creations',
  },
  receiveEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventUpdate',
    defaultMessage: 'Receive event updates',
  },
  receiveEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAggregation',
    defaultMessage: 'Receive event aggregations',
  },
  receiveEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAddition',
    defaultMessage: 'Receive event creations',
  },
  receiveMyEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAddition',
    defaultMessage: 'Receive notifications when someone add my events',
  },
});

const STATE_MESSAGE: Record<string, MessageDescriptor> = {
  '-1': messages.stateRefused,
  '0': messages.stateToControl,
  '1': messages.stateControlled,
  '2': messages.statePublished,
};

function ucFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// A rule's master/child grouping signature: rules with the same signature
// across entities are the "same setting" (a global parent + per-agenda
// children).
function signature(rule: Rule): string {
  // Stable-stringify conditions (sorted keys) so master/child pairing is
  // order-independent — matching the backend's `_.matches` — instead of
  // breaking if the API emits the same conditions in a different key order.
  const conditions = rule.conditions ?? {};
  const stable = JSON.stringify(
    Object.fromEntries(
      Object.keys(conditions)
        .sort()
        .map((k) => [k, (conditions as Record<string, unknown>)[k]]),
    ),
  );
  return `${rule.actions}|${rule.subject}|${stable}`;
}

function entityTitle(rule: Rule): string {
  return (
    rule.entity?.agendaTitle ??
    rule.entity?.title ??
    rule.entity?.fullName ??
    String(rule.identifier)
  );
}

interface NotificationsSectionProps {
  user: SettingsUser;
}

export default function NotificationsSection({
  user,
}: NotificationsSectionProps) {
  const intl = useIntl();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);

  const formIndexUrl = `/abilities/form-index?entityName=user&identifier=${user.uid}`;

  const ingest = useCallback((data: Omit<Rule, 'key'>[]) => {
    const keyed = data.map((r, i) => ({ ...r, key: `rule${i}` }) as Rule);
    setRules(keyed);
    setValues(
      keyed.reduce<Record<string, boolean>>((acc, r) => {
        acc[r.key] = !r.inverted;
        return acc;
      }, {}),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    ky.get(formIndexUrl)
      .json<Omit<Rule, 'key'>[]>()
      .then((data) => {
        if (!cancelled) ingest(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formIndexUrl, ingest]);

  // Debounce the filter input (500ms), matching the legacy behaviour.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilter(filter.trim()), 500);
    return () => clearTimeout(id);
  }, [filter]);

  // Split into the global (user) entity and the per-entity children.
  const { firstRules, childGroups, childEntityCount } = useMemo(() => {
    const all = rules ?? [];
    const isFirst = (r: Rule) =>
      r.entityName === 'user' && String(r.identifier) === String(user.uid);
    const first = all.filter(isFirst);
    const children = all.filter((r) => !isFirst(r));

    // Group children by entityName → entity (identifier).
    const byName = new Map<string, Map<string, Rule[]>>();
    for (const r of children) {
      if (!byName.has(r.entityName)) byName.set(r.entityName, new Map());
      const ents = byName.get(r.entityName)!;
      const id = String(r.identifier);
      if (!ents.has(id)) ents.set(id, []);
      ents.get(id)!.push(r);
    }

    let count = 0;
    const groups = [...byName.entries()].map(([entityName, ents]) => {
      const entities = [...ents.values()].map((entRules) => ({
        entityName,
        identifier: entRules[0].identifier,
        title: entityTitle(entRules[0]),
        rules: entRules,
      }));
      count += entities.length;
      return { entityName, entities };
    });

    return { firstRules: first, childGroups: groups, childEntityCount: count };
  }, [rules, user.uid]);

  // For each first-entity rule, the child rules that share its signature.
  const relatedBySig = useMemo(() => {
    const map = new Map<string, Rule[]>();
    for (const group of childGroups) {
      for (const ent of group.entities) {
        for (const r of ent.rules) {
          const sig = signature(r);
          if (!map.has(sig)) map.set(sig, []);
          map.get(sig)!.push(r);
        }
      }
    }
    return map;
  }, [childGroups]);

  const relatedOf = useCallback(
    (rule: Rule) => relatedBySig.get(signature(rule)) ?? [],
    [relatedBySig],
  );

  // Per child-group fuzzy search over the agenda titles (legacy used Fuse.js).
  const fusers = useMemo(
    () =>
      new Map(
        childGroups.map(
          (group) =>
            [
              group.entityName,
              new Fuse(group.entities, {
                shouldSort: true,
                threshold: 0.3,
                location: 0,
                distance: 100,
                minMatchCharLength: 1,
                keys: ['title'],
              }),
            ] as const,
        ),
      ),
    [childGroups],
  );

  const isIndeterminate = useCallback(
    (rule: Rule, vals: Record<string, boolean>): boolean => {
      const related = relatedOf(rule);
      if (!related.length) return false;
      return (
        (!vals[rule.key] && related.some((r) => vals[r.key])) ||
        (!!vals[rule.key] && related.some((r) => !vals[r.key]))
      );
    },
    [relatedOf],
  );

  // Toggle a global (parent) rule: with related children it acts as a master
  // (indeterminate/all-on → everything off; otherwise → everything on);
  // childless it is a plain toggle.
  const toggleFirst = useCallback(
    (rule: Rule) => {
      setSuccess(false);
      setValues((prev) => {
        const related = relatedOf(rule);
        if (!related.length) {
          return { ...prev, [rule.key]: !prev[rule.key] };
        }
        const turnOff =
          isIndeterminate(rule, prev) || related.every((r) => prev[r.key]);
        const next = { ...prev, [rule.key]: !turnOff };
        for (const r of related) next[r.key] = !turnOff;
        return next;
      });
    },
    [relatedOf, isIndeterminate],
  );

  const toggleChild = useCallback((rule: Rule) => {
    setSuccess(false);
    setValues((prev) => ({ ...prev, [rule.key]: !prev[rule.key] }));
  }, []);

  // Mirror the legacy SaveButton: disabled while pristine (no unsaved change).
  const dirty = useMemo(
    () => (rules ?? []).some((r) => values[r.key] !== !r.inverted),
    [rules, values],
  );

  const ruleLabel = useCallback(
    (rule: Rule): string => {
      const key = `${rule.actions}${ucFirst(rule.subject)}`;
      const descriptor = (ruleMessages as Record<string, MessageDescriptor>)[
        key
      ];
      if (!descriptor) return key;
      const stateValue = rule.conditions?.state as string | number | undefined;
      const isStateRule =
        rule.subject === 'eventChangeState' && stateValue != null;
      const stateDescriptor = isStateRule
        ? STATE_MESSAGE[String(stateValue)]
        : undefined;
      // Never hand an id-less descriptor to formatMessage (it throws); fall back
      // to the raw state value if the backend ever sends an unmapped one.
      const state = isStateRule
        ? stateDescriptor
          ? intl.formatMessage(stateDescriptor)
          : String(stateValue)
        : undefined;
      return intl.formatMessage(descriptor, { state });
    },
    [intl],
  );

  const groupHeader = useCallback(
    (scope: 'first' | 'child', tag: string): string | null => {
      const key = `${scope === 'first' ? 'firstEntity' : 'childEntity'}${ucFirst(tag)}`;
      const descriptor = (messages as Record<string, MessageDescriptor>)[key];
      return descriptor ? intl.formatMessage(descriptor) : null;
    },
    [intl],
  );

  const subscribeNewsletter = useCallback(async () => {
    setNewsletterError(false);
    try {
      await ky.post('/newsletter/subscribe', { json: {} });
      setNewsletterDone(true);
    } catch {
      setNewsletterError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rules) return;
    setSaving(true);
    setSuccess(false);
    setSaveError(false);
    try {
      const payload = rules.map(({ key, ...rule }) => ({
        ...rule,
        inverted: !values[key],
      }));
      const updated = await ky
        .patch(formIndexUrl, { json: payload })
        .json<Omit<Rule, 'key'>[]>();
      if (Array.isArray(updated)) ingest(updated);
      setSuccess(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  // Render a checkbox row for a single rule.
  const renderRule = (rule: Rule, isParent: boolean) => (
    <Checkbox
      key={rule.key}
      checked={
        isParent && isIndeterminate(rule, values)
          ? 'indeterminate'
          : !!values[rule.key]
      }
      onCheckedChange={() => (isParent ? toggleFirst(rule) : toggleChild(rule))}
    >
      {ruleLabel(rule)}
    </Checkbox>
  );

  // Group a rule list by `tag`, preserving order.
  const byTag = (list: Rule[]): [string, Rule[]][] => {
    const order: string[] = [];
    const map = new Map<string, Rule[]>();
    for (const r of list) {
      if (!map.has(r.tag)) {
        map.set(r.tag, []);
        order.push(r.tag);
      }
      map.get(r.tag)!.push(r);
    }
    return order.map((t) => [t, map.get(t)!]);
  };

  const showFilter = childEntityCount >= SEARCH_THRESHOLD;

  return (
    <AccordionItem
      value="notifications"
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
      {loading ? (
        <chakra.div display="flex" justifyContent="center" py="8">
          <Spinner />
        </chakra.div>
      ) : loadError ? (
        <MessageAlert role="alert" status="error">
          {intl.formatMessage(messages.loadError)}
        </MessageAlert>
      ) : (
        <chakra.form onSubmit={handleSubmit} maxW="2xl">
          {/* Newsletter */}
          <chakra.div
            bg="bg.subtle"
            borderRadius="l2"
            p="4"
            mb="6"
            borderWidth="1px"
            borderColor="border.emphasized"
          >
            <Text fontWeight="medium">
              {intl.formatMessage(messages.newsletterTitle)}
            </Text>
            <Text color="fg.muted" mb={newsletterDone ? '0' : '2'}>
              {intl.formatMessage(
                newsletterDone
                  ? messages.newsletterSubscribed
                  : messages.newsletterDescription,
              )}
            </Text>
            {!newsletterDone && (
              <Button
                type="button"
                variant="link"
                // link variant inherits font-size; pin to the body size (sm)
                // so it matches the surrounding text instead of the 16px box.
                fontSize="sm"
                colorPalette="blue"
                onClick={subscribeNewsletter}
              >
                {intl.formatMessage(messages.newsletterSubscribe)}
              </Button>
            )}
            {newsletterError && (
              <MessageAlert role="alert" status="error" mt="2">
                {intl.formatMessage(messages.saveError)}
              </MessageAlert>
            )}
          </chakra.div>

          {/* Global (first-entity) settings, grouped by tag */}
          {firstRules.length > 0 && (
            <VStack align="stretch" gap="4" mb="6">
              {byTag(firstRules).map(([tag, tagRules]) => {
                const header = groupHeader('first', tag);
                return (
                  <chakra.fieldset key={tag}>
                    {header && (
                      <chakra.legend fontWeight="semibold" mb="2">
                        {header}
                      </chakra.legend>
                    )}
                    <VStack align="stretch" gap="2">
                      {tagRules.map((rule) => renderRule(rule, true))}
                    </VStack>
                  </chakra.fieldset>
                );
              })}
            </VStack>
          )}

          {/* Per-agenda (child) settings */}
          {childEntityCount > 0 && (
            <VStack align="stretch" gap="4" mb="6">
              {showFilter && (
                <Field.Root>
                  <Input
                    value={filter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFilter(e.target.value)
                    }
                    placeholder={intl.formatMessage(messages.filterPlaceholder)}
                    aria-label={intl.formatMessage(messages.filterPlaceholder)}
                  />
                </Field.Root>
              )}

              {childGroups.map((group) => {
                const entities = debouncedFilter
                  ? (fusers.get(group.entityName)?.search(debouncedFilter) ??
                    [])
                  : group.entities;
                if (!entities.length) return null;
                return (
                  <AccordionRoot key={group.entityName} multiple collapsible>
                    {entities.map((ent) => (
                      <AccordionItem
                        key={`${group.entityName}.${ent.identifier}`}
                        value={`${group.entityName}.${ent.identifier}`}
                        title={
                          <chakra.span fontWeight="medium">
                            {ent.title}
                          </chakra.span>
                        }
                      >
                        <VStack align="stretch" gap="4">
                          {byTag(ent.rules).map(([tag, tagRules]) => {
                            const header = groupHeader('child', tag);
                            return (
                              <chakra.fieldset key={tag}>
                                {header && (
                                  <chakra.legend fontWeight="semibold" mb="2">
                                    {header}
                                  </chakra.legend>
                                )}
                                <VStack align="stretch" gap="2">
                                  {tagRules.map((rule) =>
                                    renderRule(rule, false),
                                  )}
                                </VStack>
                              </chakra.fieldset>
                            );
                          })}
                        </VStack>
                      </AccordionItem>
                    ))}
                  </AccordionRoot>
                );
              })}
            </VStack>
          )}

          {success && (
            <MessageAlert role="status" status="success" mb="4">
              {intl.formatMessage(messages.success)}
            </MessageAlert>
          )}
          {saveError && (
            <MessageAlert role="alert" status="error" mb="4">
              {intl.formatMessage(messages.saveError)}
            </MessageAlert>
          )}

          <Button
            type="submit"
            colorPalette="blue"
            loading={saving}
            disabled={!dirty}
          >
            {intl.formatMessage(messages.save)}
          </Button>
        </chakra.form>
      )}
    </AccordionItem>
  );
}
