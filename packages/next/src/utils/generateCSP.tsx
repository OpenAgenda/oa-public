interface generateCSPProps {
  nonce?: string;
}

type Directive = string;
type Value = string | string[];

interface Options {
  devOnly?: boolean;
}

export default function generateCSP({ nonce }: generateCSPProps = {}) {
  const policy: Map<Directive, Value[]> = new Map();

  // adder function for our policy object
  const add = (directive: Directive, value: Value, options: Options = {}) => {
    if (options.devOnly && process.env.NODE_ENV !== 'development') return;

    const values = Array.isArray(value) ? value : [value];

    if (policy.has(directive)) {
      policy.get(directive).push(...values);
    } else {
      policy.set(directive, values);
    }
  };

  add('base-uri', "'none'");
  add('default-src', "'none'");
  add('frame-ancestors', "'none'");
  add('font-src', "'self'");
  add('img-src', ["'self'", 'https:', 'data:', 'blob:']);
  add('style-src', ["'self'", "'unsafe-inline'"]);
  add('object-src', "'none'");
  add('media-src', ["'self'", 'https:', 'data:']);
  add('frame-src', "'self'");
  add('script-src', ["'strict-dynamic'", `'nonce-${nonce}'`]);
  add('script-src', "'unsafe-eval'", { devOnly: true });
  add('connect-src', "'self'");
  add('script-src-attr', "'none'");
  add('form-action', "'self'");
  add('upgrade-insecure-requests', []);
  add('block-all-mixed-content', []);
  add('report-to', 'default');
  add('report-uri', `${process.env.NEXT_PUBLIC_ROOT}/reports`);

  // return the map in a formatted value
  let result = '';
  for (const [key, values] of policy.entries()) {
    if (result.length > 0) result += '; ';
    result += `${key}${values.length ? ' ' : ''}${values.join(' ')}`;
  }
  return result;
}
