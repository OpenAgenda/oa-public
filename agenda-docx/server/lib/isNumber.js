export default (num) =>
  !Number.isNaN(Number(num)) && Number.isFinite(parseInt(num, 10));
