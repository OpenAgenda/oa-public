// Runs `fn` on the items of an async iterable, up to `concurrency` at a time,
// and yields the results in the input order. The pictures of the next events
// are fetched while the current one is written.
export default async function* mapOrdered(iterable, fn, concurrency) {
  const pending = [];

  for await (const item of iterable) {
    const result = fn(item);
    // Rejections are handled when their turn comes, not reported as unhandled.
    result.catch(() => null);
    pending.push(result);

    if (pending.length >= concurrency) {
      yield await pending.shift();
    }
  }

  while (pending.length) {
    yield await pending.shift();
  }
}
