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
  VStack,
  SimpleGrid,
  Link,
} from '@openagenda/uikit';
import { Alert, Checkbox } from '@openagenda/uikit/snippets';
import { useQuery, useQueryClient } from 'react-query';
import { useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';

const ignoredPathPatterns = [
  'api',
  'js',
  'monit(\\?.*)?',
  'latest-inbox-timestamp',
  'notifications',
  'users\\/me(\\?.*)?',
  'home\\/inbox\\/author\\.json',
  'home\\/inbox\\/conversations\\.json\\?.*',
];

const IGNORED_HTTP_PATHS = new RegExp(
  `^\\/(?:${ignoredPathPatterns.join('|')})(?:\\/|$)`,
);

function processLogs(logs) {
  return logs.reduce((acc, log) => {
    const parsedMessage = JSON.parse(log.message);
    if (!IGNORED_HTTP_PATHS.test(parsedMessage.meta.url)) {
      acc.push({
        ...log,
        message: parsedMessage,
      });
    }
    return acc;
  }, []);
}

export default function Users() {
  const intl = useIntl();

  const history = useHistory();
  const location = useLocation();
  const query = useMemo(
    () => qs.parse(location.search, { ignoreQueryPrefix: true }),
    [location.search],
  );

  const [userUid, setUserUid] = useState(query.userUid || '');
  const [inputValue, setInputValue] = useState(query.userUid || '75052324');
  const [fromDateInputValue, setFromDateInputValue] = useState(
    query.from || '',
  );
  const [toDateInputValue, setToDateInputValue] = useState(query.to || '');
  const [searchFromDate, setSearchFromDate] = useState(query.from || '');
  const [searchToDate, setSearchToDate] = useState(query.to || '');

  useEffect(() => {
    if (query.userUid) {
      setUserUid(query.userUid);
      setInputValue(query.userUid);
    }
    if (query.from) {
      setFromDateInputValue(query.from);
      setSearchFromDate(query.from);
    }
    if (query.to) {
      setToDateInputValue(query.to);
      setSearchToDate(query.to);
    }
  }, [query.userUid, query.from, query.to]);

  const queryClient = useQueryClient();
  const queryKey = [
    'supervisor',
    'users',
    'logs',
    userUid,
    searchFromDate,
    searchToDate,
  ];

  const fetcher = () =>
    new Promise((resolve, reject) => {
      const params = new URLSearchParams({ userUid });
      if (searchFromDate) params.append('from', new Date(searchFromDate).getTime());
      if (searchToDate) params.append('to', new Date(searchToDate).getTime());

      const eventSource = new EventSource(
        `/supervisor/users/logs?${params.toString()}`,
      );

      let allLogs = [];
      let sessionIds = [];

      const handleData = (data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
          return null;
        }
      };

      eventSource.addEventListener('connected', (event) => {
        console.log('SSE connected:', handleData(event.data));

        // Initialize cache with empty state
        queryClient.setQueryData(queryKey, {
          logs: [],
          sessions: [],
          isStreaming: true,
          progress: { sessions: 0, logs: 0 },
        });
      });

      eventSource.addEventListener('sessions', (event) => {
        const data = handleData(event.data);
        if (data) {
          sessionIds = sessionIds.concat(data.sessionIds);
          console.log(
            `Found ${data.sessionIds.length} new sessions, total: ${data.total}`,
          );

          // Optimistic update: add sessions to cache
          queryClient.setQueryData(queryKey, (oldData) => ({
            ...oldData,
            sessions: sessionIds,
            progress: {
              ...oldData?.progress,
              sessions: data.total,
            },
          }));
        }
      });

      eventSource.addEventListener('logs', (event) => {
        const data = handleData(event.data);
        if (data && data.logs) {
          allLogs = allLogs.concat(processLogs(data.logs));
          console.log(
            `Received ${data.logs.length} logs, total: ${data.total}`,
          );

          // Optimistic update: add new logs to cache progressively
          queryClient.setQueryData(queryKey, (oldData) => ({
            ...oldData,
            logs: allLogs,
            progress: {
              ...oldData?.progress,
              logs: data.total,
            },
          }));
        }
      });

      eventSource.addEventListener('complete', (event) => {
        const data = handleData(event.data);
        console.log('Stream complete:', data?.message);
        eventSource.close();
        resolve(allLogs);
      });

      eventSource.addEventListener('error', (event) => {
        const data = handleData(event.data);
        console.error('SSE error:', data?.error);
        eventSource.close();

        // Update cache with error state
        queryClient.setQueryData(queryKey, (oldData) => ({
          ...oldData,
          isStreaming: false,
          error: data?.error || 'SSE stream error',
        }));

        reject(new Error(data?.error || 'SSE stream error'));
      });

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();

        // Update cache with connection error
        queryClient.setQueryData(queryKey, (oldData) => ({
          ...oldData,
          isStreaming: false,
          error: 'EventSource connection failed',
        }));

        reject(new Error('EventSource connection failed'));
      };
    });

  const { isLoading, error, data } = useQuery(queryKey, fetcher, {
    enabled: !!userUid,
  });

  // Extract unique session IDs and user UIDs
  const { uniqueSessionIds, uniqueUserUids, hasNullSessionId, hasNullUserUid } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        uniqueSessionIds: [],
        uniqueUserUids: [],
        hasNullSessionId: false,
        hasNullUserUid: false,
      };
    }

    const sessionIdsSet = new Set();
    const userUidsSet = new Set();
    let foundNullSessionId = false;
    let foundNullUserUid = false;

    data.forEach((item) => {
      const sessionId = item.message?.meta?.['session.id'];
      const uid = item.message?.meta?.['user.uid'];

      if (sessionId) {
        sessionIdsSet.add(sessionId);
      } else {
        foundNullSessionId = true;
      }

      if (uid) {
        userUidsSet.add(uid);
      } else {
        foundNullUserUid = true;
      }
    });

    return {
      uniqueSessionIds: Array.from(sessionIdsSet).sort(),
      uniqueUserUids: Array.from(userUidsSet).sort(),
      hasNullSessionId: foundNullSessionId,
      hasNullUserUid: foundNullUserUid,
    };
  }, [data]);

  // State for selected filters (all checked by default)
  const [selectedSessionIds, setSelectedSessionIds] = useState(new Set());
  const [selectedUserUids, setSelectedUserUids] = useState(new Set());
  const [includeNullSessionId, setIncludeNullSessionId] = useState(true);
  const [includeNullUserUid, setIncludeNullUserUid] = useState(true);

  // Initialize selected filters when unique values change
  useEffect(() => {
    setSelectedSessionIds(new Set(uniqueSessionIds));
    setIncludeNullSessionId(true);
  }, [uniqueSessionIds]);

  useEffect(() => {
    setSelectedUserUids(new Set(uniqueUserUids));
    setIncludeNullUserUid(true);
  }, [uniqueUserUids]);

  // Calculate counts for session IDs (respecting user UID filters)
  const sessionIdCounts = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { counts: new Map(), nullCount: 0 };
    }

    const counts = new Map();
    let nullCount = 0;

    data.forEach((item) => {
      const sessionId = item.message?.meta?.['session.id'];
      const uid = item.message?.meta?.['user.uid'];

      // Apply user UID filter
      const userMatch = uid ? selectedUserUids.has(uid) : includeNullUserUid;
      if (!userMatch) return;

      if (sessionId) {
        counts.set(sessionId, (counts.get(sessionId) || 0) + 1);
      } else {
        nullCount += 1;
      }
    });

    return { counts, nullCount };
  }, [data, selectedUserUids, includeNullUserUid]);

  // Calculate counts for user UIDs (respecting session ID filters)
  const userUidCounts = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { counts: new Map(), nullCount: 0 };
    }

    const counts = new Map();
    let nullCount = 0;

    data.forEach((item) => {
      const sessionId = item.message?.meta?.['session.id'];
      const uid = item.message?.meta?.['user.uid'];

      // Apply session ID filter
      const sessionMatch = sessionId
        ? selectedSessionIds.has(sessionId)
        : includeNullSessionId;
      if (!sessionMatch) return;

      if (uid) {
        counts.set(uid, (counts.get(uid) || 0) + 1);
      } else {
        nullCount += 1;
      }
    });

    return { counts, nullCount };
  }, [data, selectedSessionIds, includeNullSessionId]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return data;
    }

    return data.filter((item) => {
      const sessionId = item.message?.meta?.['session.id'];
      const uid = item.message?.meta?.['user.uid'];

      // Session ID filter
      let sessionMatch;
      if (sessionId) {
        // If item has a session ID, check if it's selected
        sessionMatch = selectedSessionIds.has(sessionId);
      } else {
        // If item has no session ID, check if null option is selected
        sessionMatch = includeNullSessionId;
      }

      // User UID filter
      let userMatch;
      if (uid) {
        // If item has a user UID, check if it's selected
        userMatch = selectedUserUids.has(uid);
      } else {
        // If item has no user UID, check if null option is selected
        userMatch = includeNullUserUid;
      }

      return sessionMatch && userMatch;
    });
  }, [
    data,
    selectedSessionIds,
    selectedUserUids,
    includeNullSessionId,
    includeNullUserUid,
  ]);

  // Toggle individual session ID
  const toggleSessionId = (sessionId) => {
    setSelectedSessionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // Toggle individual user UID
  const toggleUserUid = (uid) => {
    setSelectedUserUids((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uid)) {
        newSet.delete(uid);
      } else {
        newSet.add(uid);
      }
      return newSet;
    });
  };

  // Toggle all session IDs
  const toggleAllSessionIds = () => {
    const allSelected = selectedSessionIds.size === uniqueSessionIds.length
      && (!hasNullSessionId || includeNullSessionId);

    if (allSelected) {
      setSelectedSessionIds(new Set());
      setIncludeNullSessionId(false);
    } else {
      setSelectedSessionIds(new Set(uniqueSessionIds));
      setIncludeNullSessionId(true);
    }
  };

  // Toggle all user UIDs
  const toggleAllUserUids = () => {
    const allSelected = selectedUserUids.size === uniqueUserUids.length
      && (!hasNullUserUid || includeNullUserUid);

    if (allSelected) {
      setSelectedUserUids(new Set());
      setIncludeNullUserUid(false);
    } else {
      setSelectedUserUids(new Set(uniqueUserUids));
      setIncludeNullUserUid(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newUserUid = inputValue.trim();
      setUserUid(newUserUid);

      const searchParams = { userUid: newUserUid };
      if (fromDateInputValue) searchParams.from = fromDateInputValue;
      if (toDateInputValue) searchParams.to = toDateInputValue;

      setSearchFromDate(fromDateInputValue);
      setSearchToDate(toDateInputValue);

      history.push({
        pathname: location.pathname,
        search: qs.stringify(searchParams),
      });
    }
  };

  return (
    <div className="chakra-reset">
      <Container maxW="7xl" bg="white" my="12" p="12" fontSize="16px">
        <Heading size="lg" mb={6}>
          Tracker les utilisateurs
        </Heading>

        <Box as="form" onSubmit={handleSubmit} mb={6}>
          <HStack gap={4} align="end" wrap="wrap">
            <Box>
              <div>User UID:</div>
              <Input
                id="userUid"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Entrez l'UID utilisateur"
                minW="200px"
              />
            </Box>
            <Box>
              <div>Date de début:</div>
              <Input
                id="fromDate"
                type="datetime-local"
                value={fromDateInputValue}
                onChange={(e) => setFromDateInputValue(e.target.value)}
                minW="200px"
              />
            </Box>
            <Box>
              <div>Date de fin:</div>
              <Input
                id="toDate"
                type="datetime-local"
                value={toDateInputValue}
                onChange={(e) => setToDateInputValue(e.target.value)}
                minW="200px"
              />
            </Box>
            <Button type="submit" isDisabled={!inputValue.trim()}>
              Rechercher
            </Button>
          </HStack>
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            Erreur: {error.message}
          </Alert>
        )}

        {userUid && (
          <>
            {/* Streaming Progress Display */}
            {data?.isStreaming && (
              <Box
                border="1px solid"
                borderColor="primary.solid"
                bg="bg.subtle"
                p={4}
                mb={4}
              >
                <div>
                  <Text fontWeight="bold">Streaming en cours...</Text>
                  <Text fontSize="sm">
                    Sessions trouvées: {data?.progress?.sessions || 0} | Logs
                    reçus: {data?.progress?.logs || 0}
                  </Text>
                </div>
              </Box>
            )}

            {/* Error Display */}
            {data?.error && (
              <Alert status="error" mb={4}>
                <Text>Erreur: {data.error}</Text>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && !data?.isStreaming && (
              <Box
                border="1px solid"
                borderColor="primary.solid"
                bg="bg.subtle"
                p={4}
                mb={4}
              >
                <Text>Initialisation du streaming...</Text>
              </Box>
            )}

            {error && !data?.error && (
              <Alert status="error" mb={4}>
                <Text>Erreur lors du chargement: {error.message}</Text>
              </Alert>
            )}

            {data
              && !data?.isStreaming
              && Array.isArray(data)
              && data.length > 0 && (
                <Box>
                  <Text mb={4}>
                    Logs trouvés pour l&apos;utilisateur{' '}
                    <strong>{userUid}</strong>: {data.length} entrées
                    {filteredData.length !== data.length && (
                      <> ({filteredData.length} après filtrage)</>
                    )}
                  </Text>

                  {/* Filters Section */}
                  {(uniqueSessionIds.length > 0
                    || uniqueUserUids.length > 0
                    || hasNullSessionId
                    || hasNullUserUid) && (
                    <Box
                      mb={6}
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Heading size="md" mb={4}>
                        Filtres
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        {/* Session IDs Filter */}
                        {(uniqueSessionIds.length > 0 || hasNullSessionId) && (
                          <Box>
                            <HStack mb={3}>
                              <Heading size="sm">ID Session</Heading>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={toggleAllSessionIds}
                              >
                                {selectedSessionIds.size
                                  === uniqueSessionIds.length
                                && (!hasNullSessionId || includeNullSessionId)
                                  ? 'Tout désélectionner'
                                  : 'Tout sélectionner'}
                              </Button>
                            </HStack>
                            <VStack
                              align="start"
                              gap={2}
                              maxH="300px"
                              overflowY="auto"
                            >
                              {hasNullSessionId && (
                                <Checkbox
                                  key="null-session-id"
                                  checked={includeNullSessionId}
                                  onCheckedChange={() =>
                                    setIncludeNullSessionId(
                                      !includeNullSessionId,
                                    )}
                                >
                                  <Text fontStyle="italic" color="gray.600">
                                    (sans session ID) (
                                    {sessionIdCounts.nullCount})
                                  </Text>
                                </Checkbox>
                              )}
                              {uniqueSessionIds.map((sessionId) => (
                                <Checkbox
                                  key={sessionId}
                                  checked={selectedSessionIds.has(sessionId)}
                                  onCheckedChange={() =>
                                    toggleSessionId(sessionId)}
                                >
                                  {sessionId} (
                                  {sessionIdCounts.counts.get(sessionId) || 0})
                                </Checkbox>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {/* User UIDs Filter */}
                        {(uniqueUserUids.length > 0 || hasNullUserUid) && (
                          <Box>
                            <HStack mb={3}>
                              <Heading size="sm">User UID</Heading>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={toggleAllUserUids}
                              >
                                {selectedUserUids.size
                                  === uniqueUserUids.length
                                && (!hasNullUserUid || includeNullUserUid)
                                  ? 'Tout désélectionner'
                                  : 'Tout sélectionner'}
                              </Button>
                            </HStack>
                            <VStack
                              align="start"
                              gap={2}
                              maxH="300px"
                              overflowY="auto"
                            >
                              {hasNullUserUid && (
                                <Checkbox
                                  key="null-user-uid"
                                  checked={includeNullUserUid}
                                  onCheckedChange={() =>
                                    setIncludeNullUserUid(!includeNullUserUid)}
                                >
                                  <Text fontStyle="italic" color="gray.600">
                                    (sans user UID) ({userUidCounts.nullCount})
                                  </Text>
                                </Checkbox>
                              )}
                              {uniqueUserUids.map((uid) => (
                                <Checkbox
                                  key={uid}
                                  checked={selectedUserUids.has(uid)}
                                  onCheckedChange={() => toggleUserUid(uid)}
                                >
                                  {uid} ({userUidCounts.counts.get(uid) || 0})
                                </Checkbox>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  )}

                  <Table.Root size="sm" display="block" overflowX="auto">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Date</Table.ColumnHeader>
                        <Table.ColumnHeader>ID Session</Table.ColumnHeader>
                        <Table.ColumnHeader>ID User</Table.ColumnHeader>
                        <Table.ColumnHeader>Statut</Table.ColumnHeader>
                        <Table.ColumnHeader>Méthode</Table.ColumnHeader>
                        <Table.ColumnHeader>URL</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredData.map((item) => (
                        <Table.Row
                          key={`${item.timestamp}-${item.sequence_number_str}`}
                        >
                          <Table.Cell whiteSpace="nowrap">
                            {intl.formatDate(item.timestamp, {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </Table.Cell>
                          <Table.Cell>
                            {item.message.meta['session.id']}
                          </Table.Cell>
                          <Table.Cell>
                            <Link
                              href={`/admin/users?userUid=${item.message.meta['user.uid']}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              color="primary.500 !important"
                              _hover={{
                                color: 'primary.600 !important',
                              }}
                            >
                              {item.message.meta['user.uid']}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{item.message.meta.status}</Table.Cell>
                          <Table.Cell>{item.message.meta.method}</Table.Cell>
                          <Table.Cell>{item.message.meta.url}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
