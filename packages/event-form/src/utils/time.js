export function fZ(n) {
  return (n < 0 ? '-' : '') + (Math.abs(n) < 10 ? '0' : '') + Math.abs(n);
}

export function convertTimezoneOffset(dtz) {
  console.log(dtz);
  const [hours, minutes] = `${Math.abs(dtz)}`.split('.');

  return `${dtz > 0 ? '-' : '+'}${[fZ(hours), fZ((parseInt(minutes ?? 0, 10) * 60) / 10)].join(':')}`;
}
