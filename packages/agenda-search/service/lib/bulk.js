import logs from '@openagenda/logs';

const log = logs('bulk');

// `delete` is a header-only op (no body line). `index` carries the full
// doc. `update` wraps the doc in `{ doc }`.
function _bodyFor(operation, agenda) {
  if (operation === 'delete') return null;
  if (operation === 'index') return agenda;
  return { doc: agenda };
}

// `delete` reports success as 200 / 404 (404 = doc already gone); the
// others as 200 / 201.
function _isSuccess(operation, status) {
  if (operation === 'delete') return [200, 404].includes(status);
  return [200, 201].includes(status);
}

export default async ({ client, index, operation }, agendas) => {
  if (!agendas.length) return 0;

  const result = await client.bulk({
    index,
    body: agendas.reduce((carry, agenda) => {
      const header = { [operation]: { _id: agenda.uid } };
      const body = _bodyFor(operation, agenda);
      return body === null
        ? carry.concat([header])
        : carry.concat([header, body]);
    }, []),
  });

  const items = result.body.items || [];

  for (const item of items) {
    // ES returns the per-op result keyed by the operation name.
    const opResult = item[operation] || item.index;
    if (!_isSuccess(operation, opResult?.status)) {
      log(
        'error',
        `bulk ${operation} failed for agenda ${opResult?._id}`,
        opResult,
      );
    }
  }

  return items.length;
};
