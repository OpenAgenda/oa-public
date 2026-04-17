// Round-trip-safe stringifier for Next.js page `searchParams` objects.
// Arrays are preserved as repeated keys (URLSearchParams semantics), which
// is how Next re-parses the URL on the next request.
export default function stringifySearchParams(
  params: Record<string, string | string[] | undefined>,
): string {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else if (value != null) {
      qs.set(key, value);
    }
  }

  return qs.toString();
}
