type DirectiveValueFunctionProps = {
  nonce?: string;
};
type DirectiveValueFunction = (props: DirectiveValueFunctionProps) => string;
type DirectiveValue = string | DirectiveValueFunction;
type NormalizedDirectives = Map<string, Iterable<DirectiveValue>>;

type Options = {
  useDefaults?: boolean;
  directives?: Record<string, null | Iterable<DirectiveValue>>;
  props?: DirectiveValueFunctionProps;
};

export const DEFAULT_DIRECTIVES: Record<string, Iterable<DirectiveValue>> = {
  defaultSrc: ["'none'"],
  baseUri: ["'none'"],
  fontSrc: [
    "'self'",
    'https://cdn.openagenda.com',
    'https://client.crisp.chat',
  ],
  formAction: ["'self'"],
  frameAncestors: ["'self'"],
  imgSrc: [
    "'self'",
    'https:',
    'data:',
    'blob:',
    ...process.env.NEXT_PUBLIC_MATOMO_URL
      ? [`https://${process.env.NEXT_PUBLIC_MATOMO_URL}`]
      : [],
    'https://client.crisp.chat',
    'https://image.crisp.chat',
    'https://storage.crisp.chat',
  ],
  objectSrc: ["'none'"],
  scriptSrc: [
    'https:', // backward compatibility
    "'unsafe-inline'", // backward compatibility
    "'strict-dynamic'",
    ({ nonce = '' }) => `'nonce-${nonce}'`,
    ...process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [],
    'https://client.crisp.chat',
    'https://settings.crisp.chat',
  ],
  scriptSrcAttr: ["'none'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    ...process.env.NEXT_PUBLIC_ASSET_PREFIX
      ? [new URL(process.env.NEXT_PUBLIC_ASSET_PREFIX).origin]
      : [],
    'https://client.crisp.chat',
  ],
  mediaSrc: ["'self'", 'https:', 'data:', 'https://client.crisp.chat'],
  frameSrc: [
    "'self'",
    'https://service.mtcaptcha.com',
    'https://service2.mtcaptcha.com',
    'https://game.crisp.chat',
  ],
  connectSrc: [
    "'self'",
    ...process.env.NEXT_PUBLIC_ASSET_PREFIX
      ? [new URL(process.env.NEXT_PUBLIC_ASSET_PREFIX).origin]
      : [],
    ...process.env.NEXT_PUBLIC_MATOMO_URL
      ? [`https://${process.env.NEXT_PUBLIC_MATOMO_URL}`]
      : [],
    'https://client.crisp.chat',
    'https://storage.crisp.chat',
    'wss://client.relay.crisp.chat',
    'wss://stream.relay.crisp.chat',
  ],
  upgradeInsecureRequests: [],
  reportTo: ['default'],
  reportUri: [`${process.env.NEXT_PUBLIC_ROOT}/reports`],
};

const getDefaultDirectives = () => ({ ...DEFAULT_DIRECTIVES });

const dashify = (str: string): string =>
  str.replace(/[A-Z]/g, (capitalLetter) => `-${capitalLetter.toLowerCase()}`);

const isDirectiveValueInvalid = (directiveValue: string): boolean =>
  /;|,/.test(directiveValue);

const has = (obj: Readonly<object>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

function normalizeDirectives(options: Options): NormalizedDirectives {
  const defaultDirectives = getDefaultDirectives();

  const { useDefaults = true, directives: rawDirectives = defaultDirectives } =
    options;

  const result: NormalizedDirectives = new Map();
  const directiveNamesSeen = new Set<string>();
  const directivesExplicitlyDisabled = new Set<string>();

  for (const rawDirectiveName in rawDirectives) {
    if (!has(rawDirectives, rawDirectiveName)) {
      continue;
    }

    if (
      rawDirectiveName.length === 0 ||
      /[^a-zA-Z0-9-]/.test(rawDirectiveName)
    ) {
      throw new Error(
        `Content-Security-Policy received an invalid directive name ${JSON.stringify(rawDirectiveName)}`,
      );
    }

    const directiveName = dashify(rawDirectiveName);

    if (directiveNamesSeen.has(directiveName)) {
      throw new Error(
        `Content-Security-Policy received a duplicate directive ${JSON.stringify(directiveName)}`,
      );
    }
    directiveNamesSeen.add(directiveName);

    const rawDirectiveValue = rawDirectives[rawDirectiveName];
    let directiveValue: Iterable<DirectiveValue>;

    if (rawDirectiveValue === null) {
      directivesExplicitlyDisabled.add(directiveName);
      continue;
    } else if (typeof rawDirectiveValue === 'string') {
      directiveValue = [rawDirectiveValue];
    } else if (!rawDirectiveValue) {
      throw new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`,
      );
    } else {
      directiveValue = rawDirectiveValue;
    }

    for (const element of directiveValue) {
      if (typeof element === 'string' && isDirectiveValueInvalid(element)) {
        throw new Error(
          `Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`,
        );
      }
    }

    result.set(directiveName, directiveValue);
  }

  if (useDefaults) {
    Object.entries(defaultDirectives).forEach(
      ([defaultDirectiveName, defaultDirectiveValue]) => {
        if (
          !result.has(defaultDirectiveName) &&
          !directivesExplicitlyDisabled.has(defaultDirectiveName)
        ) {
          result.set(defaultDirectiveName, defaultDirectiveValue);
        }
      },
    );
  }

  if (!result.size) {
    throw new Error(
      'Content-Security-Policy has no directives. Either set some or disable the header',
    );
  }
  if (
    !result.has('default-src') &&
    !directivesExplicitlyDisabled.has('default-src')
  ) {
    throw new Error(
      'Content-Security-Policy needs a default-src but none was provided.',
    );
  }

  return result;
}

function getHeaderValue(
  normalizedDirectives: Readonly<NormalizedDirectives>,
  props: DirectiveValueFunctionProps = {},
) {
  const result: string[] = [];

  normalizedDirectives.forEach((rawDirectiveValue, directiveName) => {
    let directiveValue = '';
    for (const element of rawDirectiveValue) {
      directiveValue += ` ${element instanceof Function ? element(props) : element}`;
    }
    if (!directiveValue) {
      result.push(directiveName);
    } else if (isDirectiveValueInvalid(directiveValue)) {
      throw new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`,
      );
    } else {
      result.push(`${directiveName}${directiveValue}`);
    }
  });

  return result.join(';');
}

export default function contentSecurityPolicy(options: Options = {}) {
  const normalizedDirectives = normalizeDirectives({
    directives: options.directives ?? DEFAULT_DIRECTIVES,
    useDefaults: options.useDefaults ?? false,
    props: options.props,
  });
  return getHeaderValue(normalizedDirectives, options.props);
}
