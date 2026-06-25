import { useMemo, useEffect, useState } from 'react';
import {
  Container,
  Heading,
  Input,
  Button,
  Box,
  HStack,
  Text,
  Table,
  Link,
} from '@openagenda/uikit';
import { Alert } from '@openagenda/uikit/snippets';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';

// One paginated section of matched members (legacy store or schema-form),
// loaded incrementally by id cursor. `query` is its useInfiniteQuery result.
function MembersSection({ title, query }) {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = query;
  const members = (data?.pages ?? []).flatMap((p) => p.members ?? []);

  return (
    <>
      <Heading size="md" mb={3}>
        {title} — {members.length}
        {hasNextPage ? '+' : ''}
      </Heading>
      {error ? (
        <Alert status="error" mb={4}>
          <Text>Erreur : {error.message}</Text>
        </Alert>
      ) : null}
      {isLoading ? <Text mb={4}>Chargement…</Text> : null}
      {members.length ? (
        <Table.Root size="sm" mb={3}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Agenda</Table.ColumnHeader>
              <Table.ColumnHeader>Rôle</Table.ColumnHeader>
              <Table.ColumnHeader>Email membre</Table.ColumnHeader>
              <Table.ColumnHeader>Source / correspond à</Table.ColumnHeader>
              <Table.ColumnHeader>Utilisateur</Table.ColumnHeader>
              <Table.ColumnHeader>Admin</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((m) => (
              <Table.Row key={m.memberId}>
                <Table.Cell>
                  {m.agendaTitle || '—'}
                  <Text fontSize="xs" color="gray.500">
                    {m.agendaUid}
                  </Text>
                </Table.Cell>
                <Table.Cell>{m.role || '—'}</Table.Cell>
                <Table.Cell>{m.memberEmail || '—'}</Table.Cell>
                <Table.Cell>
                  {(m.sources ?? []).join(', ')}
                  <Text fontSize="xs" color="gray.500">
                    {(m.matchedEmails ?? []).join(', ')}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {m.user ? (
                    <>
                      {m.user.fullName}
                      <Text fontSize="xs" color="gray.500">
                        {m.user.email} · {m.user.uid}
                      </Text>
                    </>
                  ) : (
                    <Text color="red.500">
                      {m.deletedUser ? 'utilisateur supprimé' : 'sans compte'}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {m.user ? (
                    <Link href={m.user.adminLink}>admin/users</Link>
                  )
                    : '—'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )
        : !isLoading && <Text mb={6}>Aucun membre trouvé.</Text>}
      {hasNextPage ? (
        <Button
          mb={6}
          variant="outline"
          isLoading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Charger plus
        </Button>
      ) : null}
    </>
  );
}

// Reconcile a Crisp complaint to an account: a visitor often gives a different
// (or wrong) email than their session, so we look up users and members tied to
// either address — including emails buried in member additional info — and link
// to /admin/users for each resolved user. Reached from the Crisp lookup link
// (oa_lookup) carrying ?uid=&sessionEmail=&crispEmail=. Each list is fetched and
// paginated server-side by id cursor (complete, no cap), loaded on demand.
export default function Lookup() {
  const apiClient = useApiClient();
  const history = useHistory();
  const location = useLocation();
  const query = useMemo(
    () => qs.parse(location.search, { ignoreQueryPrefix: true }),
    [location.search],
  );

  const [uid, setUid] = useState(query.uid || '');
  const [sessionEmail, setSessionEmail] = useState(query.sessionEmail || '');
  const [crispEmail, setCrispEmail] = useState(query.crispEmail || '');

  // Keep inputs in sync when the URL changes (e.g. arriving from a Crisp link).
  useEffect(() => {
    setUid(query.uid || '');
    setSessionEmail(query.sessionEmail || '');
    setCrispEmail(query.crispEmail || '');
  }, [query.uid, query.sessionEmail, query.crispEmail]);

  const canSubmit = !!(uid || sessionEmail || crispEmail);

  // The search runs off the *committed* criteria in the URL, not the live
  // inputs, so typing never refetches — only submitting (or following a Crisp
  // link) does. It also makes every search deep-linkable.
  const committedUid = query.uid || '';
  const committedSessionEmail = query.sessionEmail || '';
  const committedCrispEmail = query.crispEmail || '';
  const hasCriteria = !!(
    committedUid
    || committedSessionEmail
    || committedCrispEmail
  );

  const baseParams = () => {
    const p = new URLSearchParams();
    if (committedUid) p.set('uid', committedUid);
    if (committedSessionEmail) p.set('sessionEmail', committedSessionEmail);
    if (committedCrispEmail) p.set('crispEmail', committedCrispEmail);
    return p;
  };
  const key = [committedUid, committedSessionEmail, committedCrispEmail];

  const usersQuery = useQuery(
    ['supervisor', 'lookup', 'users', ...key],
    () => {
      const p = baseParams();
      p.set('kind', 'users');
      return apiClient.get(`/api/supervisor/lookup?${p.toString()}`).json();
    },
    { enabled: hasCriteria, keepPreviousData: true },
  );

  const membersPageFn = (kind) =>
    ({ pageParam = 0 }) => {
      const p = baseParams();
      p.set('kind', kind);
      if (pageParam) p.set('after', pageParam);
      return apiClient.get(`/api/supervisor/lookup?${p.toString()}`).json();
    };
  const membersOptions = {
    enabled: hasCriteria,
    keepPreviousData: true,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  };

  const accountQuery = useInfiniteQuery(
    ['supervisor', 'lookup', 'account', ...key],
    membersPageFn('account'),
    membersOptions,
  );
  const legacyQuery = useInfiniteQuery(
    ['supervisor', 'lookup', 'legacy', ...key],
    membersPageFn('legacy'),
    membersOptions,
  );
  const schemaQuery = useInfiniteQuery(
    ['supervisor', 'lookup', 'schema', ...key],
    membersPageFn('schema'),
    membersOptions,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const search = {};
    if (uid) search.uid = uid;
    if (sessionEmail) search.sessionEmail = sessionEmail;
    if (crispEmail) search.crispEmail = crispEmail;
    history.push({ pathname: location.pathname, search: qs.stringify(search) });
  };

  const users = usersQuery.data?.users ?? [];

  return (
    <div className="chakra-reset">
      <Container maxW="7xl" bg="white" my="12" p="12" fontSize="16px">
        <Heading size="lg" mb={6}>
          Recherche de compte
        </Heading>

        <Box as="form" onSubmit={handleSubmit} mb={6}>
          <HStack gap={4} align="end" wrap="wrap">
            <Box>
              <div>UID</div>
              <Input
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="UID"
              />
            </Box>
            <Box>
              <div>Email de session</div>
              <Input
                value={sessionEmail}
                onChange={(e) => setSessionEmail(e.target.value)}
                placeholder="session@exemple.fr"
              />
            </Box>
            <Box>
              <div>Email Crisp</div>
              <Input
                value={crispEmail}
                onChange={(e) => setCrispEmail(e.target.value)}
                placeholder="crisp@exemple.fr"
              />
            </Box>
            <Button type="submit" isDisabled={!canSubmit}>
              Rechercher
            </Button>
          </HStack>
        </Box>

        {hasCriteria ? (
          <>
            <Heading size="md" mb={3}>
              Utilisateurs — {users.length}
            </Heading>
            {users.length ? (
              <Table.Root size="sm" mb={8}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>UID</Table.ColumnHeader>
                    <Table.ColumnHeader>Nom</Table.ColumnHeader>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>Correspond à</Table.ColumnHeader>
                    <Table.ColumnHeader>Admin</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((u) => (
                    <Table.Row key={u.uid}>
                      <Table.Cell>{u.uid}</Table.Cell>
                      <Table.Cell>
                        {u.fullName}
                        {u.isRemoved ? ' (supprimé)' : ''}
                      </Table.Cell>
                      <Table.Cell>{u.email}</Table.Cell>
                      <Table.Cell>
                        {(u.matchedEmails ?? []).join(', ')}
                      </Table.Cell>
                      <Table.Cell>
                        <Link href={u.adminLink}>admin/users</Link>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Text mb={8}>Aucun utilisateur trouvé pour ces emails.</Text>
            )}

            <MembersSection
              title="Membres rattachés aux comptes trouvés"
              query={accountQuery}
            />
            <MembersSection
              title="Membres dont l'email de contact correspond"
              query={legacyQuery}
            />
            <MembersSection
              title="Membres dont un champ de formulaire correspond"
              query={schemaQuery}
            />
          </>
        ) : null}
      </Container>
    </div>
  );
}
