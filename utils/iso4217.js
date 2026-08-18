// ISO 4217 — code list and minor-unit exponents, embedded, no dependency.
//
// Money is carried as an INTEGER in the currency's minor unit. Converting needs
// the exponent, and the exponent is NOT always 2: JPY and XOF have none, KWD and
// TND have three digits. Dividing by 100 is the bug this module exists to
// prevent.
//
// Why a table rather than a package: a static code -> exponent lookup that
// changes about never, which also ships to front bundles; a dependency would add
// a supply-chain surface for three lines of data.
//
// `CODES` is a snapshot of the active list (2024), kept deliberately LENIENT — a
// few recently withdrawn codes are retained, because accepting a dead currency is
// harmless while rejecting a live one refuses real organiser data.

const EXPONENT_0 = [
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF',
  'UGX', 'UYI', 'VND', 'VUV', 'XAF', 'XOF', 'XPF', 'XDR', 'XSU', 'XUA',
];

const EXPONENT_3 = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];

const EXPONENT_4 = ['CLF', 'UYW'];

const CODES = [
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV',
  'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF',
  'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CZK',
  'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP',
  'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL',
  'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD',
  'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD',
  'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA',
  'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV',
  'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB',
  'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB',
  'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL',
  'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT',
  'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN',
  'UYI', 'UYU', 'UYW', 'UZS', 'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF',
  'XCD', 'XCG', 'XDR', 'XOF', 'XPF', 'XSU', 'XUA', 'YER', 'ZAR', 'ZMW',
  'ZWG', 'ZWL',
];

const CODE_SET = new Set(CODES);
const EXPONENTS = new Map(
  []
    .concat(EXPONENT_0.map((c) => [c, 0]))
    .concat(EXPONENT_3.map((c) => [c, 3]))
    .concat(EXPONENT_4.map((c) => [c, 4])),
);

const isCurrencyCode = (code) => CODE_SET.has(code);

const exponentOf = (code) => {
  if (!isCurrencyCode(code)) {
    throw new Error(`iso4217: unknown currency code ${code}`);
  }
  return EXPONENTS.has(code) ? EXPONENTS.get(code) : 2;
};

// Minor units -> the display string. A STRING, not a number: "25.00" must not
// decay into 25 and lose its scale.
const toMajor = (minor, code) => {
  // isSafeInteger, not isInteger: 1e21 is an "integer" whose String() is
  // '1e+21', and the digit arithmetic below would emit '1e+.21'. An amount that
  // large is an upstream overflow, so fail rather than ship a nonsense string.
  if (!Number.isSafeInteger(minor)) {
    throw new Error(
      `iso4217: amount must be a safe integer in minor units, got ${minor}`,
    );
  }

  const exponent = exponentOf(code);

  if (exponent === 0) {
    return String(minor);
  }

  const sign = minor < 0 ? '-' : '';
  const digits = String(Math.abs(minor)).padStart(exponent + 1, '0');

  return `${sign}${digits.slice(0, -exponent)}.${digits.slice(-exponent)}`;
};

// The inverse, for sources that expose major units. Rounds rather than
// truncates: floating-point major units are the source's problem, not a reason
// to lose a cent.
// A decimal amount, and nothing that merely survives `Number()`. The whole
// family below coerces to a number without being one, and each lands as a real
// price: `' '`, `[]` and `false` become 0 — a FREE ticket — `true` becomes 1,
// `[5]` becomes 5, and `'0x10'` becomes 16. Exponent notation is refused with
// them: `'1e3'` from a ticketing API is a bug at the source, not a price.
const DECIMAL = /^\s*-?\d+(\.\d+)?\s*$/;

const toMinor = (major, code) => {
  // Guard BEFORE the arithmetic. `Number(null)` is 0, so a field that is
  // absent-as-null would turn an unknown price into a free one, and NaN defeats
  // the precision check below (`Math.abs(NaN - NaN) > 1e-6` is false), so
  // `'abc'` or the very plausible French decimal comma `'12,50'` would blow up
  // much later instead of here.
  const usable = typeof major === 'number'
    ? Number.isFinite(major)
    : typeof major === 'string' && DECIMAL.test(major);

  if (!usable) {
    throw new Error(`iso4217: ${JSON.stringify(major)} is not a usable amount`);
  }

  const exponent = exponentOf(code);
  const amount = Number(major);

  const scaled = amount * 10 ** exponent;
  const rounded = Math.round(scaled);

  if (Math.abs(scaled - rounded) > 1e-6) {
    throw new Error(
      `iso4217: ${major} ${code} has more precision than the currency allows`,
    );
  }

  return rounded;
};

const currencyCodes = () => CODES.slice();

export {
  isCurrencyCode, exponentOf, toMajor, toMinor, currencyCodes,
};
