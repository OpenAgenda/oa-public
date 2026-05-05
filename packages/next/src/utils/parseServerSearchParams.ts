import qs, { ParsedQs } from 'qs';

type ServerSearchParams = Record<string, string | string[] | undefined>;

/**
 * Next.js Server Components receive `searchParams` as a flat object where
 * keys are the literal URL keys (including `[0]`, `[1]`, etc.). This helper
 * round-trips through URLSearchParams + qs to get the proper nested object
 * the rest of the codebase expects (e.g. `?particularites[0]=61` →
 * `{ particularites: ['61'] }`).
 */
export default function parseServerSearchParams(
  searchParams: ServerSearchParams,
): ParsedQs {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, v));
    } else if (value != null) {
      usp.set(key, value);
    }
  }
  return qs.parse(usp.toString());
}
