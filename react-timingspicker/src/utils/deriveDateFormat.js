export default function deriveDateFormat(intl) {
  const isoString = '2018-09-25T03:04';

  const intlString = intl.formatDate(isoString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // hour:  '2-digit',
    // minute: '2-digit',
    hour12: false,
  });

  return intlString
    .replace('2018', 'yyyy')
    .replace(/09/, 'MM')
    .replace('25', 'dd')
    .replace(/03/, 'HH')
    .replace(/04/, 'mm');
}
