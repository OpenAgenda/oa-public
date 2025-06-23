// src/utils/time.js
function fZ(n) {
  return (n < 0 ? "-" : "") + (Math.abs(n) < 10 ? "0" : "") + Math.abs(n);
}
function convertTimezoneOffset(dtz) {
  const [hours, minutes] = `${Math.abs(dtz)}`.split(".");
  return `${dtz > 0 ? "-" : "+"}${[fZ(hours), fZ(parseInt(minutes ?? 0, 10) * 60 / 10)].join(":")}`;
}

export {
  fZ,
  convertTimezoneOffset
};
//# sourceMappingURL=chunk-UJTMWBIB.js.map