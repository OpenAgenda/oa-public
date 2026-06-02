// Poll an async side-effect until it materializes, instead of asserting after a
// fixed `setTimeout`. Many cibul-node functional flows finish their HTTP/API
// response before their side-effects land — bull jobs (cascades, anonymize),
// better-auth after-hooks (onEmailVerified → runOnActivation), or detached
// `.then()` writes (e.g. runOnActivation's fire-and-forget Inbox.create). A
// fixed sleep races those under load and flakes; polling for the actual
// condition is deterministic.
//
// `condition` is called repeatedly until it returns a truthy value, which is
// then returned (so callers can use the resolved value). It may be sync or
// async. Throws once `timeout` elapses so the test fails loudly instead of
// hanging.
export default async function waitFor(
  condition,
  { timeout = 5000, interval = 50, message = 'condition to be met' } = {},
) {
  const start = Date.now();
  for (;;) {
    const result = await condition();
    if (result) return result;
    if (Date.now() - start >= timeout) {
      throw new Error(
        `waitFor: timed out after ${timeout}ms waiting for ${message}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
