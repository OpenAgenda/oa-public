export default function convertPhpDateFormatToDateFns(phpFormat) {
  const formatMapping = {
    // Days
    d: 'dd', // Day of the month, 2 digits with leading zeros (01 to 31)
    D: 'EEE', // A textual representation of a day (Mon through Sun)
    j: 'd', // Day of the month without leading zeros (1 to 31)
    l: 'EEEE', // A full textual representation of the day of the week (Sunday through Saturday)
    N: 'i', // ISO-8601 numeric representation of the day of the week (1 for Monday through 7 for Sunday)
    S: 'o', // English ordinal suffix for the day of the month, 2 characters (st, nd, rd or th)
    w: 'e', // Numeric representation of the day of the week (0 for Sunday through 6 for Saturday)
    z: 'D', // The day of the year (starting from 0) (0 through 365)

    // Weeks
    W: 'I', // ISO-8601 week number of year, weeks starting on Monday

    // Months
    F: 'MMMM', // A full textual representation of a month (January through December)
    m: 'MM', // Numeric representation of a month, with leading zeros (01 to 12)
    M: 'MMM', // A short textual representation of a month (Jan through Dec)
    n: 'M', // Numeric representation of a month, without leading zeros (1 to 12)
    t: '', // Number of days in the given month (28 through 31) (no direct equivalent in date-fns)

    // Years
    L: '', // Whether it's a leap year (1 if it is a leap year, 0 otherwise) (no direct equivalent in date-fns)
    o: 'RRRR', // ISO-8601 week-numbering year (4 digits)
    Y: 'yyyy', // A full numeric representation of a year, 4 digits
    y: 'yy', // A two digit representation of a year

    // Time
    a: 'aaa', // Lowercase Ante meridiem and Post meridiem (am or pm)
    A: 'a', // Uppercase Ante meridiem and Post meridiem (AM or PM)
    B: '', // Swatch Internet time (000 through 999) (no direct equivalent in date-fns)
    g: 'h', // 12-hour format of an hour without leading zeros (1 through 12)
    G: 'H', // 24-hour format of an hour without leading zeros (0 through 23)
    h: 'hh', // 12-hour format of an hour with leading zeros (01 through 12)
    H: 'HH', // 24-hour format of an hour with leading zeros (00 through 23)
    i: 'mm', // Minutes with leading zeros (00 to 59)
    s: 'ss', // Seconds with leading zeros (00 through 59)
    u: 'SSS', // Microseconds (added as milliseconds in date-fns)

    // Timezone
    e: 'zzz', // Timezone identifier (e.g., America/Los_Angeles) (not directly supported, use zzz for generic support)
    T: 'zz', // Timezone abbreviation (e.g., MST)
    Z: 'X', // Timezone offset in seconds (e.g., -43200 to 43200)
  };

  let dateFnsFormat = '';
  let inLiteral = false;

  for (let i = 0; i < phpFormat.length; i++) {
    const char = phpFormat[i];

    if (char === '\\') {
      if (!inLiteral) {
        dateFnsFormat += "'";
        inLiteral = true;
      }
      i += 1; // Skip the backslash
      dateFnsFormat += phpFormat[i] || '';
      continue;
    }

    if (inLiteral) {
      dateFnsFormat += "'";
      inLiteral = false;
    }

    if (formatMapping[char] !== undefined) {
      dateFnsFormat += formatMapping[char];
    } else {
      dateFnsFormat += char;
    }
  }

  if (inLiteral) {
    dateFnsFormat += "'";
  }

  return dateFnsFormat;
}
